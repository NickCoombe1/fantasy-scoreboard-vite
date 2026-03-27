import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { teamID, gameweek } = req.query;
  if (!teamID || !gameweek) return res.status(400).json({ error: "Both teamID and gameweek are required" });

  try {
    const teamIDNumber = parseInt(String(teamID), 10);
    const gameweekNumber = parseInt(String(gameweek), 10);
    if (isNaN(teamIDNumber) || isNaN(gameweekNumber)) throw new Error("Invalid parameters");

    const response = await fetch(`https://draft.premierleague.com/api/entry/${teamIDNumber}/event/${gameweekNumber}`);
    if (!response.ok) throw new Error(`Failed to fetch team data: ${response.statusText}`);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
