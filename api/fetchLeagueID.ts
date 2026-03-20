import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "Team ID is required" });

  try {
    const response = await fetch(`https://draft.premierleague.com/api/entry/${teamId}/public`);
    if (!response.ok) throw new Error("Failed to fetch data from FPL API");
    const data = await response.json();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
