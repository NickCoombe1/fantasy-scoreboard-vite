import { TabGroup, TabPanel, TabPanels } from "@headlessui/react";
import { LeagueData } from "@/models/league";
import { GameStatusData } from "@/models/game";
import { ScoringData } from "@/models/scoringData";
import TabHeader from "@/components/common/TabHeader";
import RefreshButton from "@/components/scoring/RefreshButton";
import ScoringPage from "@/components/scoring/ScoringPage";
import LeaguePage from "@/components/scoring/LeaguePage";

interface ScoringTabsProps {
  leagueData: LeagueData;
  teamScoringData: ScoringData;
  gameweekInfo: GameStatusData;
  teamID?: number;
  leagueID: number;
}

export default function ScoringTabs({
  leagueData,
  teamScoringData,
  gameweekInfo,
  teamID,
  leagueID,
}: ScoringTabsProps) {
  return (
    <div className={"relative md:top-[-3.125rem]"}>
      <TabGroup defaultIndex={1} className={"flex flex-col items-center gap-4 "}>
        <TabHeader leagueName={leagueData.league.name} />
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
        {teamID && leagueID && (
          <div className={"flex justify-center"}>
            <RefreshButton />{" "}
          </div>
        )}
        <TabPanels className={"w-full"}>
          {leagueData && teamScoringData && gameweekInfo && (
            <>
              <TabPanel>
                <ScoringPage
                  leagueData={leagueData}
                  teamScoringData={teamScoringData}
                />{" "}
              </TabPanel>
              <TabPanel>
                <LeaguePage
                  leagueData={leagueData}
                  leagueId={leagueID}
                  gameweek={gameweekInfo?.current_event}
                />
              </TabPanel>
            </>
          )}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
