import ScoreboardHeaderVersus from "@/components/scoring/ScoreboardHeaderVersus";
import ScoreBoard from "@/components/scoring/Scoreboard";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { LeagueEntry } from "@/models/league";
import { ScoringData } from "@/models/scoringData";

interface MatchupProps {
  team: LeagueEntry;
  opponent: LeagueEntry;
  teamScoring: ScoringData;
  opponentScoring: ScoringData;
}

const Matchup: React.FC<MatchupProps> = ({
  team,
  opponent,
  teamScoring,
  opponentScoring,
}) => {
  const [showScoreboard, setShowScoreboard] = useState(false);
  return (
    <div className={"flex flex-col align-center gap-2 md:gap-8"}>
      {" "}
      <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-6 w-full">
        {/* Mobile view */}
        <div className="md:hidden w-full flex gap justify-center gap-1">
          <ScoreboardHeaderVersus
            teamName={team.entry_name ?? "AVERAGE"}
            totalPoints={teamScoring.totalPoints}
            playersPlayed={teamScoring.playersPlayed}
            alignPoints="right"
          />
          <div className="dark:text-dark-90 text-light-90 font-semibold text-base leading-[.875rem] mt-5 md:hidden">
            V
          </div>
          <ScoreboardHeaderVersus
            teamName={opponent.entry_name ?? "AVERAGE"}
            totalPoints={opponentScoring.totalPoints}
            playersPlayed={opponentScoring.playersPlayed}
            alignPoints="left"
          />
        </div>
        {/* Desktop view */}
        <div className="flex flex-col items-start gap-6 w-full">
          <div className="hidden md:block w-full">
            <ScoreboardHeaderVersus
              teamName={team.entry_name ?? "AVERAGE"}
              totalPoints={teamScoring.totalPoints}
              playersPlayed={teamScoring.playersPlayed}
              alignPoints="right"
            />
          </div>
          {showScoreboard && <ScoreBoard picks={teamScoring.picks} />}
        </div>
        <div className="dark:text-dark-90 text-light-90 font-semibold text-[1.625rem] leading-normal mt-4 hidden md:block">
          V
        </div>
        <div className="flex flex-col items-start gap-6 w-full">
          <div className="hidden md:block w-full">
            <ScoreboardHeaderVersus
              teamName={opponent.entry_name ?? "AVERAGE"}
              totalPoints={opponentScoring.totalPoints}
              playersPlayed={opponentScoring.playersPlayed}
              alignPoints="left"
            />
          </div>
          {showScoreboard && <ScoreBoard picks={opponentScoring.picks} />}
        </div>
      </div>
      <div className="opacity-60 justify-center items-center gap-6 inline-flex mt-4">
        <button
          onClick={() => setShowScoreboard(!showScoreboard)}
          className="flex items-center justify-center gap-2 text-sm font-medium text-light-default dark:text-dark-default"
        >
          <div className="text-center text-light-60 dark:text-dark-60 text-sm font-medium font-roobertMono uppercase leading-3 tracking-wide">
            {`${!showScoreboard ? "SHOW" : "HIDE"} SCOREBOARD`}
          </div>
          <FontAwesomeIcon
            icon={showScoreboard ? faChevronUp : faChevronDown}
            className={"text-light-default dark:text-dark-default"}
          />
        </button>
      </div>{" "}
    </div>
  );
};

export default Matchup;
