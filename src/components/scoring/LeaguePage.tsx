import { useMemo } from "react";
import { LeagueData } from "@/models/league";
import { useAllLeagueScoringData } from "@/api/queries";
import Matchup from "@/components/scoring/Matchup";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface LeaguePageProps {
  gameweek: number;
  leagueData: LeagueData;
  leagueId: number;
}

export default function LeaguePage({ gameweek, leagueData, leagueId }: LeaguePageProps) {
  const { data: teamsScoringData, isPending, isFetching } = useAllLeagueScoringData(leagueId, gameweek);

  const enrichedScoringData = useMemo(() => {
    if (!teamsScoringData) return null;
    const data = { ...teamsScoringData };
    for (const team of leagueData.league_entries) {
      if (!team.entry_id && Object.keys(data).length > 0) {
        const allScores = Object.values(data);
        const avgPoints = Math.round(allScores.reduce((s, t) => s + (t.totalPoints ?? 0), 0) / allScores.length);
        const avgPlayed = Math.round(allScores.reduce((s, t) => s + (t.playersPlayed ?? 0), 0) / allScores.length);
        data[team.id] = { totalPoints: avgPoints, playersPlayed: avgPlayed, picks: [] };
      }
    }
    return data;
  }, [teamsScoringData, leagueData.league_entries]);

  if (isPending && !enrichedScoringData) {
    return (
      <div className="flex justify-center mt-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!enrichedScoringData) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-6">
      {isFetching && (
        <div className="text-center text-light-60 dark:text-dark-60 text-xs font-medium font-roobertMono uppercase tracking-wide animate-pulse mb-4">
          Updating...
        </div>
      )}
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
