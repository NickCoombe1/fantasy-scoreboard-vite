import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { gameweek } = req.query;
  if (!gameweek) return res.status(400).json({ error: "gameweek is required" });

  try {
    const response = await fetch(`https://draft.premierleague.com/api/event/${gameweek}/fixtures`);
    if (!response.ok) throw new Error("Failed to fetch fixture data");
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
