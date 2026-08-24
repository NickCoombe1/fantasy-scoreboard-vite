import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  processTeamData,
  type FplBootstrapResponse,
  type PlayerDataResponse,
  type FplTeamPicksResponse,
  type Fixtures,
} from "./_lib/scoring";

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
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
