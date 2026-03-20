import { LeagueData } from "@/models/league";
import { useAllLeagueScoringData } from "@/api/queries";
import Matchup from "@/components/scoring/Matchup";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface LeaguePageProps {
  gameweek: number;
  leagueData: LeagueData;
}

export default function LeaguePage({ gameweek, leagueData }: LeaguePageProps) {
  const entries = leagueData.league_entries
    .filter((e) => e.entry_id)
    .map((e) => ({ id: e.id, entryId: e.entry_id }));
  const { data: teamsScoringData, isPending } = useAllLeagueScoringData(entries, gameweek);

  if (isPending || !teamsScoringData) {
    return (
      <div className="flex justify-center mt-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle average scoring for entries without entry_id
  const enrichedScoringData = { ...teamsScoringData };
  for (const team of leagueData.league_entries) {
    if (!team.entry_id && Object.keys(enrichedScoringData).length > 0) {
      const allScores = Object.values(enrichedScoringData);
      const avgPoints = Math.round(allScores.reduce((s, t) => s + (t.totalPoints ?? 0), 0) / allScores.length);
      const avgPlayed = Math.round(allScores.reduce((s, t) => s + (t.playersPlayed ?? 0), 0) / allScores.length);
      enrichedScoringData[team.id] = { totalPoints: avgPoints, playersPlayed: avgPlayed, picks: [] };
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-6">
      <div className="w-full md:w-2/3 flex-col justify-start items-center gap-8 md:gap-20 inline-flex">
        <div className="flex flex-col justify-center gap-8 md:gap-16 w-full">
          {leagueData.matches
            .filter((match) => match.event === gameweek)
            .map((match, index) => {
              const team1 = leagueData.league_entries.find((t) => t.id === match.league_entry_1);
              const team2 = leagueData.league_entries.find((t) => t.id === match.league_entry_2);
              if (!team1 || !team2) return <div key={index} className="text-red-500">Error: Team data missing.</div>;

              const team1Data = enrichedScoringData[team1.id];
              const team2Data = enrichedScoringData[team2.id];
              if (!team1Data || !team2Data) return <div key={index} className="text-red-500">Error: Scoring data missing.</div>;

              return (
                <div key={index}>
                  <Matchup team={team1} opponent={team2} teamScoring={team1Data} opponentScoring={team2Data} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
