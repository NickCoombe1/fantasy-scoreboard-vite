import { useMemo } from "react";
import { LeagueData } from "@/models/league";
import { ScoringData } from "@/models/scoringData";
import Matchup from "@/components/scoring/Matchup";

interface LeaguePageProps {
  gameweek: number;
  leagueData: LeagueData;
  teamsScoringData: Record<number, ScoringData>;
}

export default function LeaguePage({ gameweek, leagueData, teamsScoringData }: LeaguePageProps) {
  const enrichedScoringData = useMemo(() => {
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
