import { LeagueData } from "@/models/league";
import { ScoringData } from "@/models/scoringData";
import { computeLiveStandings } from "@/lib/computeLiveStandings";

interface LeagueTableProps {
  leagueData: LeagueData;
  teamsScoringData: Record<number, ScoringData>;
  currentGameweek: number;
  currentGameweekFinished: boolean;
  teamID?: number;
  onTeamClick: (teamEntryId: number) => void;
}

export default function LeagueTable({
  leagueData,
  teamsScoringData,
  currentGameweek,
  currentGameweekFinished,
  teamID,
  onTeamClick,
}: LeagueTableProps) {
  // leagueData.standings lags until FPL fully processes a gameweek, and even
  // leagueData.matches's points are only a daily-batch value — teamsScoringData
  // (same source as the Scoring tab) is the actually-live one, so it overrides
  // the current gameweek's contribution to the table.
  const rows = computeLiveStandings(leagueData, { currentGameweek, teamsScoringData })
    .map((standing) => ({
      standing,
      entry: leagueData.league_entries.find((e) => e.id === standing.league_entry),
    }))
    .filter((row): row is { standing: typeof row.standing; entry: NonNullable<typeof row.entry> } => !!row.entry)
    .sort((a, b) => a.standing.rank_sort - b.standing.rank_sort);

  return (
    <div className="w-full md:w-2/3 mx-auto px-2">
      {!currentGameweekFinished && (
        <div className="flex items-center justify-center gap-2 text-light-60 dark:text-dark-60 text-xs font-medium font-roobertMono uppercase tracking-wide mb-5">
          <span className="w-2 h-2 rounded-full bg-light-red dark:bg-dark-red animate-pulse flex-shrink-0" />
          <span className="leading-none whitespace-nowrap">Live - pts subject to change</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-light-60 dark:text-dark-60 text-xs font-medium font-roobertMono uppercase tracking-wide">
              <th className="px-2 py-2 text-left">Team</th>
              <th className="px-2 py-2">P</th>
              <th className="px-2 py-2">W</th>
              <th className="px-2 py-2">D</th>
              <th className="px-2 py-2">L</th>
              <th className="px-2 py-2">PF</th>
              <th className="hidden md:table-cell px-2 py-2">PA</th>
              <th className="px-2 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ standing, entry }) => {
              const isOwnTeam = teamID != null && entry.entry_id === teamID;
              return (
                <tr
                  key={entry.id}
                  onClick={() => onTeamClick(entry.id)}
                  className={`cursor-pointer text-light-90 dark:text-dark-90 text-sm md:text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 ${
                    isOwnTeam ? "bg-black/10 dark:bg-white/10" : ""
                  }`}
                >
                  <td className="px-2 py-3 text-left">{entry.entry_name ?? "Unknown"}</td>
                  <td className="px-2 py-3">{standing.matches_played}</td>
                  <td className="px-2 py-3">{standing.matches_won}</td>
                  <td className="px-2 py-3">{standing.matches_drawn}</td>
                  <td className="px-2 py-3">{standing.matches_lost}</td>
                  <td className="px-2 py-3">{standing.points_for}</td>
                  <td className="hidden md:table-cell px-2 py-3">{standing.points_against}</td>
                  <td className="px-2 py-3 font-semibold">{standing.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
