import { createLazyFileRoute } from "@tanstack/react-router";
import { useGameWeekDetails, useAllLeagueScoringData } from "@/api/queries";
import ScoringTabs from "@/components/scoring/ScoringTabs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StyledButton from "@/components/common/StyledButton";

export const Route = createLazyFileRoute("/scoring/$leagueId/$teamId")({
  component: ScoringRoute,
});

function ScoringRoute() {
  const { leagueId, teamId } = Route.useParams();
  const leagueIdNum = Number(leagueId);
  const teamIdNum = Number(teamId);

  const {
    data: gameweekInfo,
    isPending: gwPending,
    isError: gwError,
    refetch: refetchGameweek,
  } = useGameWeekDetails();
  const {
    data: leagueScoringData,
    isPending: leaguePending,
    isFetching,
    isError: leagueError,
    isPlaceholderData,
    refetch: refetchLeagueScoring,
  } = useAllLeagueScoringData(leagueIdNum, gameweekInfo?.current_event ?? 0);

  // isPlaceholderData means the data shown belongs to the *previous* league/gameweek
  // (see placeholderData in useAllLeagueScoringData) — treat it as still loading so a
  // league switch never briefly renders the old league's scores under the new URL.
  if (gwPending || (leaguePending && !leagueScoringData) || isPlaceholderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (gwError || leagueError || !gameweekInfo || !leagueScoringData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-red-500">An unexpected error occurred while loading the page.</p>
        <StyledButton
          label={"TRY AGAIN"}
          type={"button"}
          onClick={() => {
            refetchGameweek();
            refetchLeagueScoring();
          }}
        />
      </div>
    );
  }

  return (
    <ScoringTabs
      leagueData={leagueScoringData.leagueData}
      teamsScoringData={leagueScoringData.scoring}
      gameweekInfo={gameweekInfo}
      isFetching={isFetching}
      teamID={teamIdNum}
      leagueID={leagueIdNum}
    />
  );
}
