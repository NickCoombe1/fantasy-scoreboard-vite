import { createLazyFileRoute } from "@tanstack/react-router";
import { useGameWeekDetails, useScoringData, useLeagueData } from "@/api/queries";
import ScoringTabs from "@/components/scoring/ScoringTabs";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export const Route = createLazyFileRoute("/scoring/$leagueId/$teamId")({
  component: ScoringRoute,
});

function ScoringRoute() {
  const { leagueId, teamId } = Route.useParams();
  const leagueIdNum = Number(leagueId);
  const teamIdNum = Number(teamId);

  const { data: gameweekInfo, isPending: gwPending } = useGameWeekDetails();
  const { data: leagueData, isPending: leaguePending } = useLeagueData(leagueIdNum);
  const { data: teamScoringData, isPending: scoringPending } = useScoringData(
    teamIdNum,
    gameweekInfo?.current_event ?? 0,
  );

  if (gwPending || leaguePending || scoringPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gameweekInfo || !leagueData || !teamScoringData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">An unexpected error occurred while loading the page.</p>
      </div>
    );
  }

  return (
    <ScoringTabs
      leagueData={leagueData}
      teamScoringData={teamScoringData}
      gameweekInfo={gameweekInfo}
      teamID={teamIdNum}
      leagueID={leagueIdNum}
    />
  );
}
