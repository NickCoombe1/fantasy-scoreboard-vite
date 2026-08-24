import { LeagueData, Standing } from "@/models/league";
import { ScoringData } from "@/models/scoringData";

const POINTS_PER_WIN = 3;
const POINTS_PER_DRAW = 1;

interface LiveScoring {
  currentGameweek: number;
  teamsScoringData: Record<number, ScoringData>;
}

/**
 * FPL's own `standings` field is only recalculated once a gameweek is fully
 * processed (every match marked `finished`) — it reads all-zero for the
 * entire gameweek while it's live. `matches[].*_points` is more current than
 * that, but still only a daily-batch value, not truly real-time — the same
 * live-per-minute numbers already used on the Scoring tab (via
 * fetchLeagueScoring/teamsScoringData, sourced from the live gameweek
 * endpoint) are the actually-live source. So: trust `matches` for gameweeks
 * that have already finished, but substitute the live per-team totals for
 * whichever gameweek is currently in progress.
 *
 * Assumes the standard FPL Draft head-to-head scoring: 3 points for a win,
 * 1 for a draw, 0 for a loss.
 */
export function computeLiveStandings(leagueData: LeagueData, liveScoring?: LiveScoring): Standing[] {
  const totals = new Map<number, Omit<Standing, "rank" | "rank_sort" | "last_rank">>();

  for (const entry of leagueData.league_entries) {
    totals.set(entry.id, {
      league_entry: entry.id,
      matches_played: 0,
      matches_won: 0,
      matches_drawn: 0,
      matches_lost: 0,
      points_for: 0,
      points_against: 0,
      total: 0,
    });
  }

  for (const match of leagueData.matches) {
    if (!match.started) continue; // fixture hasn't kicked off yet

    const team1 = totals.get(match.league_entry_1);
    const team2 = totals.get(match.league_entry_2);
    if (!team1 || !team2) continue;

    let team1Points = match.league_entry_1_points;
    let team2Points = match.league_entry_2_points;
    if (liveScoring && match.event === liveScoring.currentGameweek) {
      team1Points = liveScoring.teamsScoringData[match.league_entry_1]?.totalPoints ?? team1Points;
      team2Points = liveScoring.teamsScoringData[match.league_entry_2]?.totalPoints ?? team2Points;
    }

    team1.matches_played += 1;
    team2.matches_played += 1;
    team1.points_for += team1Points;
    team1.points_against += team2Points;
    team2.points_for += team2Points;
    team2.points_against += team1Points;

    if (team1Points > team2Points) {
      team1.matches_won += 1;
      team1.total += POINTS_PER_WIN;
      team2.matches_lost += 1;
    } else if (team1Points < team2Points) {
      team2.matches_won += 1;
      team2.total += POINTS_PER_WIN;
      team1.matches_lost += 1;
    } else {
      team1.matches_drawn += 1;
      team2.matches_drawn += 1;
      team1.total += POINTS_PER_DRAW;
      team2.total += POINTS_PER_DRAW;
    }
  }

  const sorted = Array.from(totals.values()).sort(
    (a, b) => b.total - a.total || b.points_for - a.points_for,
  );

  return sorted.map((standing, index) => ({
    ...standing,
    rank: index + 1,
    rank_sort: index + 1,
    last_rank: null,
  }));
}
