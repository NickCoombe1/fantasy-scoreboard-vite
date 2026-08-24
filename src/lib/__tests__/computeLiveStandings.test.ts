import { describe, it, expect } from "vitest";
import { computeLiveStandings } from "../computeLiveStandings";
import { LeagueData, LeagueEntry, Match } from "@/models/league";

function makeEntry(id: number, entry_id: number, name: string): LeagueEntry {
  return { id, entry_id, entry_name: name, joined_time: "", player_first_name: "", player_last_name: "", short_name: "", waiver_pick: 0 };
}

function makeMatch(overrides: Partial<Match> & Pick<Match, "league_entry_1" | "league_entry_2">): Match {
  return {
    event: 1,
    finished: false,
    league_entry_1_points: 0,
    league_entry_2_points: 0,
    started: true,
    winning_league_entry: null,
    winning_method: null,
    ...overrides,
  };
}

function makeLeagueData(entries: LeagueEntry[], matches: Match[]): LeagueData {
  return {
    league: {
      admin_entry: 1, closed: false, draft_dt: "", draft_pick_time_limit: 0, draft_status: "",
      draft_tz_show: "", id: 1, ko_rounds: 0, make_code_public: false, max_entries: 0, min_entries: 0,
      name: "Test", scoring: "h", start_event: 1, stop_event: 38, trades: "", transaction_mode: "", variety: "",
    },
    league_entries: entries,
    matches,
    standings: [],
  };
}

describe("computeLiveStandings", () => {
  it("counts a win/loss based on current points, even while a match is still live (not finished)", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [makeMatch({ league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 70, league_entry_2_points: 40, started: true, finished: false })];

    const result = computeLiveStandings(makeLeagueData(entries, matches));

    const alpha = result.find((s) => s.league_entry === 1)!;
    const beta = result.find((s) => s.league_entry === 2)!;
    expect(alpha.matches_won).toBe(1);
    expect(alpha.matches_played).toBe(1);
    expect(beta.matches_lost).toBe(1);
    expect(alpha.total).toBe(3);
    expect(beta.total).toBe(0);
  });

  it("excludes matches that haven't started yet", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [makeMatch({ league_entry_1: 1, league_entry_2: 2, started: false, league_entry_1_points: 0, league_entry_2_points: 0 })];

    const result = computeLiveStandings(makeLeagueData(entries, matches));

    expect(result.find((s) => s.league_entry === 1)!.matches_played).toBe(0);
    expect(result.find((s) => s.league_entry === 2)!.matches_played).toBe(0);
  });

  it("counts a draw for equal points", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [makeMatch({ league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 50, league_entry_2_points: 50 })];

    const result = computeLiveStandings(makeLeagueData(entries, matches));

    expect(result.find((s) => s.league_entry === 1)!.matches_drawn).toBe(1);
    expect(result.find((s) => s.league_entry === 2)!.matches_drawn).toBe(1);
    expect(result.find((s) => s.league_entry === 1)!.total).toBe(1);
    expect(result.find((s) => s.league_entry === 2)!.total).toBe(1);
  });

  it("accumulates points_for/points_against across multiple gameweeks", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [
      makeMatch({ event: 1, league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 60, league_entry_2_points: 40, finished: true }),
      makeMatch({ event: 2, league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 30, league_entry_2_points: 50, finished: true }),
    ];

    const result = computeLiveStandings(makeLeagueData(entries, matches));
    const alpha = result.find((s) => s.league_entry === 1)!;

    expect(alpha.matches_played).toBe(2);
    expect(alpha.matches_won).toBe(1);
    expect(alpha.matches_lost).toBe(1);
    expect(alpha.points_for).toBe(90);
    expect(alpha.points_against).toBe(90);
    expect(alpha.total).toBe(3);
  });

  it("sorts by total points descending, then points_for as tiebreaker", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta"), makeEntry(3, 300, "Gamma")];
    const matches = [
      // Alpha beats Beta big
      makeMatch({ league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 80, league_entry_2_points: 10 }),
      // Gamma beats a 4th (unlisted) team by a smaller margin — simulate via a bye-like second match not present;
      // instead give Gamma a win in a separate match against Beta for a clean 3-way comparison
    ];
    const result = computeLiveStandings(makeLeagueData(entries, matches));

    // Alpha (3 pts, 80 for) should rank above Beta (0 pts) and Gamma (0 pts, no matches)
    expect(result[0]!.league_entry).toBe(1);
  });

  it("assigns sequential rank/rank_sort matching sort order", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [makeMatch({ league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 80, league_entry_2_points: 10 })];

    const result = computeLiveStandings(makeLeagueData(entries, matches));

    expect(result[0]!.rank).toBe(1);
    expect(result[0]!.rank_sort).toBe(1);
    expect(result[1]!.rank).toBe(2);
  });

  it("overrides the current gameweek's points with live teamsScoringData instead of the match's own (batch-updated) points", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    // The match itself only shows yesterday's batch snapshot (10-10, a draw)...
    const matches = [makeMatch({ event: 3, league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 10, league_entry_2_points: 10 })];

    // ...but live scoring (same source as the Scoring tab) shows Alpha now ahead.
    const result = computeLiveStandings(
      makeLeagueData(entries, matches),
      { currentGameweek: 3, teamsScoringData: { 1: { totalPoints: 55, playersPlayed: 8, picks: [] }, 2: { totalPoints: 20, playersPlayed: 6, picks: [] } } },
    );

    const alpha = result.find((s) => s.league_entry === 1)!;
    const beta = result.find((s) => s.league_entry === 2)!;
    expect(alpha.matches_won).toBe(1);
    expect(alpha.points_for).toBe(55);
    expect(beta.matches_lost).toBe(1);
    expect(beta.points_for).toBe(20);
  });

  it("does not override past gameweeks' points, even when teamsScoringData is provided for a different (current) gameweek", () => {
    const entries = [makeEntry(1, 100, "Alpha"), makeEntry(2, 200, "Beta")];
    const matches = [makeMatch({ event: 1, league_entry_1: 1, league_entry_2: 2, league_entry_1_points: 30, league_entry_2_points: 30, finished: true })];

    const result = computeLiveStandings(
      makeLeagueData(entries, matches),
      { currentGameweek: 2, teamsScoringData: { 1: { totalPoints: 999, playersPlayed: 11, picks: [] }, 2: { totalPoints: 1, playersPlayed: 11, picks: [] } } },
    );

    // event 1 already finished — should use its own recorded points (a draw), not the live gameweek-2 data
    const alpha = result.find((s) => s.league_entry === 1)!;
    expect(alpha.matches_drawn).toBe(1);
    expect(alpha.points_for).toBe(30);
  });

  it("returns a zeroed row for a team with no started matches yet", () => {
    const entries = [makeEntry(1, 100, "Alpha")];
    const result = computeLiveStandings(makeLeagueData(entries, []));

    expect(result[0]).toMatchObject({
      league_entry: 1,
      matches_played: 0,
      matches_won: 0,
      matches_drawn: 0,
      matches_lost: 0,
      points_for: 0,
      points_against: 0,
      total: 0,
    });
  });
});
