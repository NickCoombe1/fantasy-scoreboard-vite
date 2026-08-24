import { useState } from "react";
import { TabGroup, TabPanels, TabPanel } from "@headlessui/react";
import { LeagueData } from "@/models/league";
import { GameStatusData } from "@/models/game";
import { ScoringData } from "@/models/scoringData";
import RefreshButton from "@/components/scoring/RefreshButton";
import LeaguePage from "@/components/scoring/LeaguePage";
import LeagueTable from "@/components/scoring/LeagueTable";
import TabHeader from "@/components/common/TabHeader";

interface ScoringTabsProps {
  leagueData: LeagueData;
  teamsScoringData: Record<number, ScoringData>;
  gameweekInfo: GameStatusData;
  teamID?: number;
}

const SCORING_TAB_INDEX = 0;

export default function ScoringTabs({
  leagueData,
  teamsScoringData,
  gameweekInfo,
  teamID,
}: ScoringTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(SCORING_TAB_INDEX);
  const [highlightedTeamId, setHighlightedTeamId] = useState<number | null>(null);

  const handleTeamClick = (teamEntryId: number) => {
    setHighlightedTeamId(teamEntryId);
    setSelectedIndex(SCORING_TAB_INDEX);
  };

  return (
    <div className={"relative md:top-[-3.125rem]"}>
      <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className={"flex flex-col items-center gap-4"}>
          <TabHeader leagueName={leagueData.league.name} tabs={["Scoring", "League"]} />
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
          <TabPanels className={"w-full"}>
            <TabPanel>
              <div className={"flex justify-center pb-4"}>
                <RefreshButton />
              </div>
              {leagueData && gameweekInfo && (
                <LeaguePage
                  leagueData={leagueData}
                  teamsScoringData={teamsScoringData}
                  gameweek={gameweekInfo?.current_event}
                  highlightedTeamId={highlightedTeamId}
                />
              )}
            </TabPanel>
            <TabPanel>
              {leagueData && (
                <LeagueTable leagueData={leagueData} teamID={teamID} onTeamClick={handleTeamClick} />
              )}
            </TabPanel>
          </TabPanels>
        </div>
      </TabGroup>
    </div>
  );
}
