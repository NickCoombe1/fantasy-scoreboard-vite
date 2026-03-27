import { LeagueData } from "@/models/league";
import { GameStatusData } from "@/models/game";
import { ScoringData } from "@/models/scoringData";
import RefreshButton from "@/components/scoring/RefreshButton";
import LeaguePage from "@/components/scoring/LeaguePage";

interface ScoringTabsProps {
  leagueData: LeagueData;
  teamsScoringData: Record<number, ScoringData>;
  gameweekInfo: GameStatusData;
  isFetching: boolean;
  teamID?: number;
  leagueID: number;
}

export default function ScoringTabs({
  leagueData,
  teamsScoringData,
  gameweekInfo,
  isFetching,
  teamID,
  leagueID,
}: ScoringTabsProps) {
  return (
    <div className={"relative md:top-[-3.125rem]"}>
      <div className={"flex flex-col items-center gap-4"}>
        <div className="sticky top-0 z-[2] md:z-[1000] md:top-[1.5rem] w-full md:w-auto md:px-1 px-1 pb-1 md:py-1 mt-[-2px] bg-black/5 dark:bg-black/20 rounded-b-lg md:rounded-lg shadow-custom-light-header-bottom md:shadow-custom-light-header backdrop-blur-2xl flex-col justify-start items-center inline-flex">
          <div className="text-center dark:text-dark-90 text-light-90 text-[1.625rem] font-semibold leading-normal my-4">
            {leagueData.league.name}
          </div>
        </div>
        <div className="h-[108px] md:h-[137px] flex-col justify-start items-center gap-4 flex my-6">
          {gameweekInfo && (
            <>
              <div className="self-stretch text-center text-light-80 md:text-light-60 dark:text-dark-80 dark:md:text-dark-60 text-xs md:text-sm font-medium font-roobertMono uppercase leading-3 tracking-tight md:tracking-wide">
                GAME WEEK
              </div>
              <div className="self-stretch text-center dark:text-dark-90 text-light-90 text-[5.625rem] md:text-9xl font-medium font-roobert leading-[5rem] md:leading-[6.75rem]">
                {gameweekInfo?.current_event}
              </div>
            </>
          )}
        </div>
        {isFetching && (
          <div className="text-center text-light-60 dark:text-dark-60 text-xs font-medium font-roobertMono uppercase tracking-wide animate-pulse">
            Updating...
          </div>
        )}
        {teamID && leagueID && (
          <div className={"flex justify-center"}>
            <RefreshButton />
          </div>
        )}
        <div className={"w-full"}>
          {leagueData && gameweekInfo && (
            <LeaguePage
              leagueData={leagueData}
              teamsScoringData={teamsScoringData}
              gameweek={gameweekInfo?.current_event}
            />
          )}
        </div>
      </div>
    </div>
  );
}
