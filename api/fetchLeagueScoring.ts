import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processTeamData, type ScoringData } from "./fetchScoringData";

interface LeagueEntry {
  entry_id: number;
  id: number;
}

interface LeagueDetailsResponse {
  league_entries: LeagueEntry[];
}

interface FplBootstrapResponse {
  elements: Array<{
    id: number;
    web_name: string;
    team: number;
    element_type: number;
    chance_of_playing_this_round: number | null;
  }>;
}

interface PlayerDataResponse {
  elements: Record<number, { stats: Record<string, unknown>; explain: unknown }>;
}

interface FplTeamPicksResponse {
  picks: Array<{ id: number; element: number; position: number; multiplier: number }>;
}

interface Fixture {
  team_a: number;
  team_h: number;
  finished: boolean;
  started: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { leagueID, gameweek } = req.query;
  if (!leagueID || !gameweek) {
    return res.status(400).json({ error: "Both leagueID and gameweek are required" });
  }

  try {
    const leagueIDNumber = parseInt(String(leagueID), 10);
    const gameweekNumber = parseInt(String(gameweek), 10);
    if (isNaN(leagueIDNumber) || isNaN(gameweekNumber)) {
      return res.status(400).json({ error: "Invalid leagueID or gameweek parameter" });
    }

    // Fetch league details to get team entry IDs
    const leagueResponse = await fetch(
      `https://draft.premierleague.com/api/league/${leagueIDNumber}/details`,
    );
    if (!leagueResponse.ok) throw new Error(`Failed to fetch league data: ${leagueResponse.statusText}`);
    const leagueData: LeagueDetailsResponse = await leagueResponse.json();

    const teamEntries = leagueData.league_entries.filter((e) => e.entry_id);

    // Fetch shared data once (bootstrap, live scoring, fixtures)
    // Then fetch each team's picks in parallel
    const [bootstrapData, scoringData, gameweekFixtureData, ...teamPicksResults] = await Promise.all([
      fetch("https://draft.premierleague.com/api/bootstrap-static").then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch bootstrap data: ${r.statusText}`);
        return r.json() as Promise<FplBootstrapResponse>;
      }),
      fetch(`https://draft.premierleague.com/api/event/${gameweekNumber}/live`).then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch scoring data: ${r.statusText}`);
        return r.json() as Promise<PlayerDataResponse>;
      }),
      fetch(`https://draft.premierleague.com/api/event/${gameweekNumber}/fixtures`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch fixture data");
        return r.json() as Promise<Fixture[]>;
      }),
      ...teamEntries.map((entry) =>
        fetch(
          `https://draft.premierleague.com/api/entry/${entry.entry_id}/event/${gameweekNumber}`,
        ).then((r) => {
          if (!r.ok) return null;
          return r.json() as Promise<FplTeamPicksResponse>;
        }),
      ),
    ]);

    // Process each team's data using shared bootstrap/scoring/fixtures
    const results: Record<number, ScoringData> = {};
    for (let i = 0; i < teamEntries.length; i++) {
      const teamData = teamPicksResults[i] as FplTeamPicksResponse | null;
      if (!teamData) continue;
      const entry = teamEntries[i]!;
      results[entry.id] = await processTeamData(
        bootstrapData as never,
        scoringData as never,
        teamData,
        gameweekFixtureData as never,
      );
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
