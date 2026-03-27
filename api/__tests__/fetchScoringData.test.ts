import { describe, it, expect } from "vitest";
import { getGameStatus, mapBootstrapData, processTeamData } from "../fetchScoringData";

// ---- Helpers for building test data ----

function makeFixture(overrides: Partial<{ team_a: number; team_h: number; finished: boolean; started: boolean }> = {}) {
  return {
    team_a: 1,
    team_h: 2,
    finished: false,
    started: false,
    ...overrides,
  };
}

function makeBootstrap(elements: Array<{ id: number; web_name: string; team: number; element_type: number; chance_of_playing_this_round: number | null }>) {
  return { elements };
}

function makeScoringData(elements: Record<number, { stats: Record<string, unknown>; explain: unknown }>) {
  return { elements } as never;
}

function makeTeamData(picks: Array<{ id: number; element: number; position: number; multiplier: number }>) {
  return { picks };
}

// ---- getGameStatus ----

describe("getGameStatus", () => {
  it("returns finished when team found and game finished", () => {
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];
    expect(getGameStatus(5, fixtures)).toEqual({ isFinished: true, isInProgress: false });
  });

  it("returns in progress when team found, started but not finished", () => {
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, started: true, finished: false })];
    expect(getGameStatus(5, fixtures)).toEqual({ isFinished: false, isInProgress: true });
  });

  it("returns not started when team found, not started", () => {
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, started: false, finished: false })];
    expect(getGameStatus(5, fixtures)).toEqual({ isFinished: false, isInProgress: false });
  });

  it("matches home team", () => {
    const fixtures = [makeFixture({ team_a: 1, team_h: 5, started: true, finished: true })];
    expect(getGameStatus(5, fixtures)).toEqual({ isFinished: true, isInProgress: false });
  });

  it("defaults to finished when team not found", () => {
    const fixtures = [makeFixture({ team_a: 1, team_h: 2 })];
    expect(getGameStatus(99, fixtures)).toEqual({ isFinished: true, isInProgress: false });
  });

  it("defaults to finished when teamID is undefined", () => {
    const fixtures = [makeFixture()];
    expect(getGameStatus(undefined, fixtures)).toEqual({ isFinished: true, isInProgress: false });
  });
});

// ---- mapBootstrapData ----

describe("mapBootstrapData", () => {
  const baseStats = {
    minutes: 90,
    goals_scored: 1,
    assists: 0,
    clean_sheets: 1,
    goals_conceded: 0,
    own_goals: 0,
    penalties_saved: 0,
    penalties_missed: 0,
    yellow_cards: 0,
    red_cards: 0,
    saves: 0,
    bonus: 0,
    bps: 0,
    influence: 0,
    creativity: 0,
    threat: 0,
    ict_index: 0,
    starts: 1,
    expected_goals: 0,
    expected_assists: 0,
    expected_goal_involvements: 0,
    expected_goals_conceded: 0,
    total_points: 8,
    in_dreamteam: false,
    chance_of_playing_next_round: 100,
    chance_of_playing_this_round: 100,
  };

  it("maps raw picks to enriched PlayerPick objects", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "Salah", team: 5, element_type: 3, chance_of_playing_this_round: 100 },
    ]);
    const scoring = makeScoringData({
      100: { stats: baseStats, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 1 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Salah");
    expect(result[0]!.points).toBe(8);
    expect(result[0]!.isSub).toBe(false);
    expect(result[0]!.hasPlayed).toBe(true);
    expect(result[0]!.fieldPosition).toBe(3); // Midfielder
  });

  it("multiplies points by multiplier", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "Salah", team: 5, element_type: 3, chance_of_playing_this_round: 100 },
    ]);
    const scoring = makeScoringData({
      100: { stats: baseStats, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 2 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.points).toBe(16); // 8 * 2
  });

  it("falls back to Unknown when player not in bootstrap", () => {
    const bootstrap = makeBootstrap([]);
    const scoring = makeScoringData({
      100: { stats: baseStats, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 1 }]);
    const fixtures: never[] = [];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.name).toBe("Unknown");
  });

  it("marks player as sub when position > 11", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "Bench", team: 5, element_type: 2, chance_of_playing_this_round: 100 },
    ]);
    const scoring = makeScoringData({
      100: { stats: baseStats, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 12, multiplier: 1 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.isSub).toBe(true);
  });

  it("marks player as injured when chance_of_playing_this_round is 0", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "Injured", team: 5, element_type: 4, chance_of_playing_this_round: 0 },
    ]);
    const scoring = makeScoringData({
      100: { stats: { ...baseStats, minutes: 0 }, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 1 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.isInjured).toBe(true);
  });

  it("sets wasSubbedOn when game in progress and player has minutes", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "SubOn", team: 5, element_type: 3, chance_of_playing_this_round: 100 },
    ]);
    const scoring = makeScoringData({
      100: { stats: { ...baseStats, minutes: 30 }, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 1 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, started: true, finished: false })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.wasSubbedOn).toBe(true);
  });

  it("detects yellow and red cards", () => {
    const bootstrap = makeBootstrap([
      { id: 100, web_name: "Carded", team: 5, element_type: 2, chance_of_playing_this_round: 100 },
    ]);
    const scoring = makeScoringData({
      100: { stats: { ...baseStats, yellow_cards: 1, red_cards: 1 }, explain: [[]] },
    });
    const teamData = makeTeamData([{ id: 1, element: 100, position: 1, multiplier: 1 }]);
    const fixtures = [makeFixture({ team_a: 5, team_h: 10, finished: true, started: true })];

    const result = mapBootstrapData(bootstrap as never, scoring, teamData, fixtures);
    expect(result[0]!.yellowCarded).toBe(true);
    expect(result[0]!.redCarded).toBe(true);
  });
});

// ---- processTeamData ----

describe("processTeamData", () => {
  const baseStats = {
    minutes: 90,
    goals_scored: 0,
    assists: 0,
    clean_sheets: 0,
    goals_conceded: 0,
    own_goals: 0,
    penalties_saved: 0,
    penalties_missed: 0,
    yellow_cards: 0,
    red_cards: 0,
    saves: 0,
    bonus: 0,
    bps: 0,
    influence: 0,
    creativity: 0,
    threat: 0,
    ict_index: 0,
    starts: 1,
    expected_goals: 0,
    expected_assists: 0,
    expected_goal_involvements: 0,
    expected_goals_conceded: 0,
    total_points: 5,
    in_dreamteam: false,
    chance_of_playing_next_round: 100,
    chance_of_playing_this_round: 100,
  };

  function makeFullTeam() {
    // 11 starters + 4 bench, all played, all finished
    const elements: Array<{ id: number; web_name: string; team: number; element_type: number; chance_of_playing_this_round: number }> = [];
    const scoringElements: Record<number, { stats: typeof baseStats; explain: never[] }> = {};
    const picks: Array<{ id: number; element: number; position: number; multiplier: number }> = [];
    const types = [1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 1, 2, 3, 4]; // 4-4-2 + bench

    for (let i = 0; i < 15; i++) {
      const id = i + 1;
      elements.push({ id, web_name: `P${id}`, team: 1, element_type: types[i]!, chance_of_playing_this_round: 100 });
      scoringElements[id] = { stats: { ...baseStats }, explain: [] };
      picks.push({ id, element: id, position: i + 1, multiplier: 1 });
    }

    return {
      bootstrap: { elements } as never,
      scoring: { elements: scoringElements } as never,
      teamData: { picks },
      fixtures: [makeFixture({ team_a: 1, team_h: 2, finished: true, started: true })],
    };
  }

  it("sums total points for starters only", async () => {
    const { bootstrap, scoring, teamData, fixtures } = makeFullTeam();
    const result = await processTeamData(bootstrap, scoring, teamData, fixtures);

    // 11 starters * 5 points each = 55
    expect(result.totalPoints).toBe(55);
  });

  it("counts players who played and are starters", async () => {
    const { bootstrap, scoring, teamData, fixtures } = makeFullTeam();
    const result = await processTeamData(bootstrap, scoring, teamData, fixtures);

    expect(result.playersPlayed).toBe(11);
  });

  it("returns picks array with all players", async () => {
    const { bootstrap, scoring, teamData, fixtures } = makeFullTeam();
    const result = await processTeamData(bootstrap, scoring, teamData, fixtures);

    expect(result.picks).toHaveLength(15);
  });
});
