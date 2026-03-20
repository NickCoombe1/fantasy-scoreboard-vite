import { useState } from "react";
import { PlayerPick } from "@/models/playerPick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import PlayerPickCard from "@/components/scoring/PlayerRow";

type ScoreBoardProps = {
  picks: PlayerPick[];
};

export default function ScoreBoard({ picks }: ScoreBoardProps) {
  const [showBench, setShowBench] = useState(false);

  const startingPlayers = picks.filter((pick) => !pick.isSub);
  const benchPlayers = picks.filter((pick) => pick.isSub);

  return (
    <div className="w-full p-6 md:p-8 border-white/50 bg-white/70 dark:bg-white/5 rounded-2xl border  flex-col justify-start items-center gap-8 inline-flex">
      <div className="text-center text-light-60 dark:text-dark-60 text-xs md:text-sm font-medium font-roobertMono uppercase leading-[0.675rem] tracking-tight md:leading-3 md:tracking-wide">
        Starting Players
      </div>
      <div className="self-stretch flex-col justify-start items-center flex">
        {startingPlayers &&
          startingPlayers
            .sort((a, b) => a.position - b.position)
            .map((pick) => <PlayerPickCard key={pick.element} pick={pick} />)}
      </div>
      <div className="h-6 opacity-60 justify-start items-center gap-2 inline-flex">
        <button
          onClick={() => setShowBench(!showBench)}
          className="flex items-center justify-center gap-2 text-sm font-medium text-light-default dark:text-dark-default"
        >
          <div className="text-center text-light-60 dark:text-dark-60 text-sm font-medium font-roobertMono uppercase leading-3 tracking-wide">
            {`${!showBench ? "SHOW" : "HIDE"} BENCH`}
          </div>
          <FontAwesomeIcon
            icon={showBench ? faChevronUp : faChevronDown}
            className={"text-light-default dark:text-dark-default"}
          />
        </button>
      </div>{" "}
      {showBench && (
        <div className="self-stretch flex-col justify-start items-center flex">
          {benchPlayers &&
            benchPlayers
              .sort((a, b) => a.position - b.position)
              .map((pick) => <PlayerPickCard key={pick.element} pick={pick} />)}
        </div>
      )}
    </div>
  );
}
