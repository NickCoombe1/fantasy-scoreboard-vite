// NOTE: This component is not currently used — the league page is shown instead.
// Kept for potential future use as a "My Scoring" individual team view.

import ScoreBoard from "@/components/scoring/Scoreboard";
import { LeagueData } from "@/models/league";
import { ScoringData } from "@/models/scoringData";
import ScoreBoardHeader from "@/components/scoring/ScoreboardHeader";
import { useParams } from "@tanstack/react-router";

interface ScoringPageProps {
  leagueData: LeagueData;
  teamScoringData: ScoringData;
}
export default function ScoringPage({
  leagueData,
  teamScoringData,
}: ScoringPageProps) {
  const { teamId } = useParams({ strict: false }) as { teamId?: string };
  const team = leagueData?.league_entries.find(
    (team) => team.entry_id === Number(teamId),
  );

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-6">
      <div className="w-full md:w-1/2 flex-col justify-start items-center gap-8 md:gap-20 inline-flex">
        <div className="self-stretch flex-col justify-start items-center gap-2 md:gap-6 flex">
          {team && (
            <ScoreBoardHeader
              totalPoints={teamScoringData?.totalPoints || 0}
              teamName={team?.entry_name}
            />
          )}
          <ScoreBoard picks={teamScoringData.picks} />
        </div>
      </div>
    </div>
  );
}
