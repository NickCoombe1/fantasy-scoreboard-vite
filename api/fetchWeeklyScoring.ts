import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { gameweek } = req.query;
  if (!gameweek) return res.status(400).json({ error: "Gameweek parameter is required" });

  try {
    const gameweekNumber = parseInt(String(gameweek), 10);
    if (isNaN(gameweekNumber)) throw new Error("Invalid gameweek parameter");

    const response = await fetch(`https://draft.premierleague.com/api/event/${gameweekNumber}/live`);
    if (!response.ok) throw new Error(`Failed to fetch scoring data: ${response.statusText}`);
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
