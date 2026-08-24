import { createLazyFileRoute } from "@tanstack/react-router";
import { useGameWeekDetails, useAllLeagueScoringData } from "@/api/queries";
import ScoringTabs from "@/components/scoring/ScoringTabs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StyledButton from "@/components/common/StyledButton";
import { getCookie } from "@/lib/cookies";

export const Route = createLazyFileRoute("/scoring/$leagueId")({
  component: ScoringRoute,
});

function ScoringRoute() {
  const { leagueId } = Route.useParams();
  const leagueIdNum = Number(leagueId);
  // Not part of the URL — a team is only ever in one league, so the league ID
  // alone is enough to load the page, and this keeps the link shareable
  // without baking in the viewer's personal team ID. Falls back to undefined
  // (no "my team" highlighting/refresh button) if no team has been entered
  // on this device, e.g. someone opening a friend's shared league link.
  const cachedTeamId = getCookie("teamID");
  const teamIdNum = cachedTeamId ? Number(cachedTeamId) : undefined;

  const {
    data: gameweekInfo,
    isPending: gwPending,
    isError: gwError,
    isRefetching: gwRefetching,
    refetch: refetchGameweek,
  } = useGameWeekDetails();
  const {
    data: leagueScoringData,
    isPending: leaguePending,
    isError: leagueError,
    isPlaceholderData,
    isRefetching: leagueRefetching,
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
    const isRetrying = gwRefetching || leagueRefetching;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-red-500 text-center">An unexpected error occurred while loading the page.</p>
        {isRetrying ? (
          <LoadingSpinner />
        ) : (
          <StyledButton
            label={"TRY AGAIN"}
            type={"button"}
            onClick={() => {
              refetchGameweek();
              refetchLeagueScoring();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <ScoringTabs
      leagueData={leagueScoringData.leagueData}
      teamsScoringData={leagueScoringData.scoring}
      gameweekInfo={gameweekInfo}
      teamID={teamIdNum}
    />
  );
}
