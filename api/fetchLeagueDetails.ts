import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { leagueID } = req.query;
  if (!leagueID) return res.status(400).json({ error: "League ID is required" });

  try {
    const response = await fetch(`https://draft.premierleague.com/api/league/${leagueID}/details`);
    if (!response.ok) throw new Error(`Failed to fetch league data: ${response.statusText}`);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
