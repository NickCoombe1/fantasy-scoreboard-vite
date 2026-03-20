import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch("https://draft.premierleague.com/api/game");
    if (!response.ok) throw new Error(`Failed to fetch game status: ${response.statusText}`);
    const data = await response.json();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    res.status(500).json({ error: message });
  }
}
