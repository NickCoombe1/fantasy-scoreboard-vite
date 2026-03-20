import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightArrowLeft,
  faPersonRunning,
  faAward,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { PlayerPick } from "@/models/playerPick";
import RedCard from "@/components/svg/RedCard";
import YellowCard from "@/components/svg/YellowCard";
import { useTheme } from "@/hooks/useTheme";
import getElementTypeShortName from "@/hooks/displayElementType";

type PlayerPickCardProps = {
  pick: PlayerPick;
};

const PlayerPickCard: React.FC<PlayerPickCardProps> = ({ pick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const toggleDetails = () => setIsExpanded(!isExpanded);
  return (
    <div
      key={pick.element}
      className={`self-stretch ${isExpanded ? "pt-3 pb-6 gap-6" : "py-3 gap-2.5"}  border-b border-[#040404]/20 dark:border-white/20 flex-col justify-start items-start flex`}
      onClick={toggleDetails}
    >
      <div className="self-stretch h-[27px] justify-between items-center inline-flex ">
        <div className="text-center items-center text-light-90 dark:text-dark-90 text-base md:text-lg font-medium font-roobert leading-[.9rem] md:leading-none flex gap-2">
          <div className="flex items-center gap-2">
            <span className="text-light-60 dark:text-dark-60 text-xs md:text-sm font-medium font-roobertMono uppercase leading-[0.675rem] tracking-tight md:leading-3 md:tracking-wide">
              {getElementTypeShortName(pick.fieldPosition)}
            </span>
            {pick.name}
          </div>
          {pick.willBeAutosubbed && (
            <div className="z-[1] relative group">
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
              <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 text-xs dark:bg-white dark:text-black bg-black text-white py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                Autosubbed
              </span>
            </div>
          )}
          {pick.gameStatus.isInProgress && pick.wasSubbedOn && (
            <div className="z-[1] relative group">
              <FontAwesomeIcon icon={faPersonRunning} />
              <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 text-xs dark:bg-white dark:text-black bg-black text-white py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                On the Pitch
              </span>
            </div>
          )}
          {pick.points <= 0 &&
            !pick.isSub &&
            pick.hasPlayed &&
            pick.gameStatus.isFinished && (
              <div className="z-[1] relative group">
                <FontAwesomeIcon
                  icon={faAward}
                  className="text-light-red dark:text-dark-red"
                />
                <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 text-xs bg-red-500 text-light-90 dark:text-dark-90 py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                  Certified Bum
                </span>
              </div>
            )}
          {pick.yellowCarded && (
            <div className="z-[1] relative group">
              <YellowCard mode={theme} />
              <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 text-xs bg-yellow-400 text-light-90 dark:text-dark-90 py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                Yellow Card
              </span>
            </div>
          )}
          {pick.redCarded && (
            <div className="z-[1] relative group">
              <RedCard />
              <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-0.5 text-xs bg-red-500 text-light-90 dark:text-dark-90 py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                Red Card
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-center text-base md:text-lg font-medium font-roobert leading-[.9rem] md:leading-none ${
              pick.hasPlayed
                ? pick.points > 0
                  ? "text-light-green dark:text-dark-green"
                  : "text-light-red dark:text-dark-red"
                : "text-light-90 dark:text-dark-90"
            }`}
          >
            {pick.points}
          </span>
          <button>
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className={"text-light-default dark:text-dark-default"}
            />
          </button>
        </div>
      </div>{" "}
      {isExpanded && (
        <div className="self-stretch px-6 py-2 bg-black/5 dark:bg-black/20 rounded-lg justify-between items-start inline-flex">
          <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
            <div className="self-stretch py-4 md:py-3 border-b border-[#040404]/20 dark:border-white/20 justify-center items-center gap-2.5 inline-flex">
              <div className="grow shrink basis-0 text-light-60 dark:text-dark-60 text-sm font-medium font-roobertMono uppercase leading-[.9rem] md:leading-3 md:tracking-wide">
                Stat
              </div>
              <div className="grow shrink basis-0 text-light-60 dark:text-dark-60 text-sm font-medium font-roobertMono uppercase leading-[.9rem] md:leading-3 md:tracking-wide">
                Value
              </div>
              <div className="grow shrink basis-0 text-light-60 dark:text-dark-60 text-sm font-medium font-roobertMono uppercase leading-[.9rem] md:leading-3 md:tracking-wide">
                Points
              </div>
            </div>
            {pick &&
              pick.pointDetails &&
              pick?.pointDetails[0] &&
              pick?.pointDetails[0][0]?.map((detail) => (
                <>
                  <div
                    key={detail.name}
                    className="self-stretch py-3 justify-start items-center gap-2.5 inline-flex [&:not(:last-child)]:border-b border-[#040404]/20 dark:border-white/20"
                  >
                    <div className="grow shrink basis-0 text-light-90 dark:text-dark-90 text-sm font-medium font-roobert leading-3 md:tracking-wide">
                      {detail.name}
                    </div>
                    <div className="grow shrink basis-0 text-light-90 dark:text-dark-90 text-sm font-medium font-roobert leading-3 md:tracking-wide">
                      {detail.value}
                    </div>
                    <div className="grow shrink basis-0 text-light-90 dark:text-dark-90 text-sm font-medium font-roobert leading-3 md:tracking-wide">
                      {detail.points}
                    </div>
                  </div>
                </>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPickCard;
