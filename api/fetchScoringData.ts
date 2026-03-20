import type { VercelRequest, VercelResponse } from "@vercel/node";

// Inlined types
enum ElementType {
  Goalkeeper = 1,
  Defender = 2,
  Midfielder = 3,
  Forward = 4,
}

interface StatExplanation {
  name: string;
  points: number;
  value: number;
  stat: string;
}

interface PlayerStats {
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: number;
  creativity: number;
  threat: number;
  ict_index: number;
  starts: number;
  expected_goals: number;
  expected_assists: number;
  expected_goal_involvements: number;
  expected_goals_conceded: number;
  total_points: number;
  in_dreamteam: boolean;
  chance_of_playing_next_round: number;
  chance_of_playing_this_round: number;
}

interface PlayerPick {
  id: number;
  element: number;
  position: number;
  multiplier: number;
  isSub: boolean;
  points: number;
  pointDetails?: [[StatExplanation][]];
  stats?: PlayerStats;
  name: string;
  hasPlayed: boolean;
  willBeAutosubbed: boolean;
  isInjured: boolean;
  wasSubbedOn: boolean;
  yellowCarded: boolean;
  redCarded: boolean;
  fieldPosition: ElementType;
  gameStatus: {
    isFinished: boolean;
    isInProgress: boolean;
  };
}

interface RawPick {
  id: number;
  element: number;
  position: number;
  multiplier: number;
}

interface FplTeamPicksResponse {
  picks: RawPick[];
}

interface BootstrapElement {
  id: number;
  web_name: string;
  team: number;
  element_type: ElementType;
  chance_of_playing_this_round: number | null;
}

interface FplBootstrapResponse {
  elements: BootstrapElement[];
}

interface PlayerElementData {
  stats: PlayerStats;
  explain: [[StatExplanation][]];
}

interface PlayerDataResponse {
  elements: Record<number, PlayerElementData>;
}

interface Fixture {
  team_a: number;
  team_h: number;
  finished: boolean;
  started: boolean;
}

type Fixtures = Fixture[];

export interface ScoringData {
  totalPoints: number;
  picks: PlayerPick[];
  playersPlayed: number;
}

// calculateAutoSubs logic (ported from calculateAutoSubs.ts)
function calculateAutoSubs(team: PlayerPick[]): PlayerPick[] {
  const MinimumFormationRequirements = {
    [ElementType.Goalkeeper]: 1,
    [ElementType.Defender]: 3,
    [ElementType.Midfielder]: 3,
    [ElementType.Forward]: 1,
  };
  const MaximumFormationRequirements = {
    [ElementType.Goalkeeper]: 1,
  };

  const getFieldPlayersByType = (type: ElementType, players: PlayerPick[]) =>
    players.filter(
      (player) => player.fieldPosition === type && player.position < 12,
    );

  const isFormationValid = (updatedTeam: PlayerPick[]): boolean => {
    for (const [position, minRequired] of Object.entries(MinimumFormationRequirements)) {
      const count = getFieldPlayersByType(Number(position) as ElementType, updatedTeam).length;
      if (count < minRequired) return false;
    }
    for (const [position, maxRequired] of Object.entries(MaximumFormationRequirements)) {
      const count = getFieldPlayersByType(Number(position) as ElementType, updatedTeam).length;
      if (count > maxRequired) return false;
    }
    return true;
  };

  const benchPlayers = team.filter((pick) => pick.position > 11);
  team.forEach((pick) => {
    if (
      (pick.gameStatus.isFinished && !pick.hasPlayed && !pick.isSub) ||
      (pick.isInjured && !pick.hasPlayed && pick.position < 12)
    ) {
      const eligibleSubs = benchPlayers.filter((benchPick) => {
        return (
          benchPick.position >= 12 &&
          (benchPick.hasPlayed || !benchPick.gameStatus.isFinished) &&
          !benchPick.isInjured
        );
      });
      const replacement = eligibleSubs.find((sub) => {
        const originalTeam = JSON.parse(JSON.stringify(team));
        const subIndex = team.findIndex((p) => p.element === sub.element);
        const pickIndex = team.findIndex((p) => p.element === pick.element);
        if (subIndex !== -1 && pickIndex !== -1) {
          originalTeam[subIndex].position = team[pickIndex].position;
          originalTeam[pickIndex].position = team[subIndex].position;
          if (isFormationValid(originalTeam)) {
            return true;
          }
        }
        return false;
      });

      if (replacement) {
        const replacementIndex = team.findIndex((p) => p.element === replacement.element);
        const pickIndex = team.findIndex((p) => p.element === pick.element);
        if (replacementIndex !== -1 && pickIndex !== -1) {
          const tempPosition = team[pickIndex].position;
          team[pickIndex].position = team[replacementIndex].position;
          team[replacementIndex].position = tempPosition;
          team[replacementIndex].isSub = false;
          team[replacementIndex].willBeAutosubbed = true;
        }
        pick.isSub = true;
        pick.willBeAutosubbed = true;
      } else {
        pick.willBeAutosubbed = false;
      }
    }
  });
  return team;
}

function getGameStatus(
  teamID: number | undefined,
  gameweekFixtureData: Fixtures,
): { isFinished: boolean; isInProgress: boolean } {
  if (teamID) {
    for (const match of gameweekFixtureData) {
      if (match.team_a === teamID || match.team_h === teamID) {
        const isFinished = match.finished;
        const isInProgress = match.started && !match.finished;
        return { isFinished, isInProgress };
      }
    }
  }
  // Default to finished so autosub logic runs for players with no fixture found
  return { isFinished: true, isInProgress: false };
}

function mapBootstrapData(
  bootstrapData: FplBootstrapResponse,
  scoringData: PlayerDataResponse,
  teamData: FplTeamPicksResponse,
  gameweekFixtureData: Fixtures,
): PlayerPick[] {
  return teamData.picks.map((pick) => {
    const playerData = scoringData.elements[pick.element];
    const basePoints = playerData?.stats.total_points || 0;
    const totalPoints = basePoints * pick.multiplier;
    const isSub = pick.position > 11;
    const playerInfo = Object.values(bootstrapData.elements).find(
      (player) => player.id === pick.element,
    );
    const playerName = playerInfo?.web_name || "Unknown";
    const isInjured = playerInfo?.chance_of_playing_this_round == 0;

    const gameStatus = getGameStatus(playerInfo?.team, gameweekFixtureData);
    const hasPlayed = (playerData?.stats.minutes || 0) > 0;
    const fieldPosition = playerInfo?.element_type ? playerInfo.element_type : ElementType.Goalkeeper;
    const wasSubbedOn = gameStatus.isInProgress && playerData?.stats.minutes > 0;

    return {
      ...pick,
      points: totalPoints,
      pointDetails: playerData?.explain,
      name: playerName,
      isSub,
      hasPlayed,
      isInjured,
      wasSubbedOn,
      gameStatus,
      yellowCarded: playerData?.stats.yellow_cards > 0,
      redCarded: playerData?.stats.red_cards > 0,
      fieldPosition,
      stats: playerData?.stats,
      willBeAutosubbed: false,
    };
  });
}

async function processTeamData(
  bootstrapData: FplBootstrapResponse,
  scoringData: PlayerDataResponse,
  teamData: FplTeamPicksResponse,
  gameweekFixtureData: Fixtures,
): Promise<ScoringData> {
  const picks = mapBootstrapData(bootstrapData, scoringData, teamData, gameweekFixtureData);
  const sortedTeam = calculateAutoSubs(picks);
  const totalPoints = sortedTeam.reduce(
    (acc, pick) => acc + (pick.isSub ? 0 : pick.points),
    0,
  );
  const playersPlayed = sortedTeam.reduce(
    (acc, pick) => acc + (pick.hasPlayed && !pick.isSub ? 1 : 0),
    0,
  );
  return { picks: sortedTeam, totalPoints, playersPlayed };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { teamID, gameweek } = req.query;
  if (!teamID || !gameweek) {
    return res.status(400).json({ error: "Both teamID and gameweek are required" });
  }

  try {
    const teamIDNumber = parseInt(String(teamID), 10);
    const gameweekNumber = parseInt(String(gameweek), 10);
    if (isNaN(teamIDNumber) || isNaN(gameweekNumber)) {
      return res.status(400).json({ error: "Invalid teamID or gameweek parameter" });
    }

    const [bootstrapData, scoringData, teamData, gameweekFixtureData] = await Promise.all([
      fetch("https://draft.premierleague.com/api/bootstrap-static").then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch bootstrap data: ${r.statusText}`);
        return r.json() as Promise<FplBootstrapResponse>;
      }),
      fetch(`https://draft.premierleague.com/api/event/${gameweekNumber}/live`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch scoring data: ${r.statusText}`);
        return r.json() as Promise<PlayerDataResponse>;
      }),
      fetch(`https://draft.premierleague.com/api/entry/${teamIDNumber}/event/${gameweekNumber}`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch team data: ${r.statusText}`);
        return r.json() as Promise<FplTeamPicksResponse>;
      }),
      fetch(`https://draft.premierleague.com/api/event/${gameweekNumber}/fixtures`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch fixture data");
        return r.json() as Promise<Fixtures>;
      }),
    ]);

    const result = await processTeamData(bootstrapData, scoringData, teamData, gameweekFixtureData);
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
