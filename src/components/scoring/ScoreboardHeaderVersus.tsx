import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons";

type ScoreBoardProps = {
  teamName: string;
  totalPoints: number;
  alignPoints: "left" | "right";
  playersPlayed: number;
};

export default function ScoreboardHeaderVersus({
  teamName,
  totalPoints,
  alignPoints,
  playersPlayed,
}: ScoreBoardProps) {
  return (
    <div className="self-stretch justify-start items-center gap-2 md:gap-6 flex flex-col ">
      <div
        className={`self-stretch justify-start items-center gap-4 md:gap-6 flex  md:flex-row ${alignPoints === "left" ? "flex-col" : "flex-col-reverse md:inline-flex"} `}
      >
        {alignPoints === "left" && (
          <div className="flex md:gap-2">
            <div className="w-[3.375rem] h-[3.375rem] md:h-[4.4rem] md:px-10 md:py-6 bg-light-default dark:bg-white  rounded-2xl border border-white/50 justify-center items-center flex self-start mx-4 md:mx-0">
              <div className="text-center text-[#eae8f0] dark:text-light-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.875rem] md:leading-normal">
                {" "}
                {totalPoints}
              </div>
            </div>{" "}
            <div className="w-[3.375rem] h-[3.375rem] md:h-[4.4rem] md:px-10 md:py-6 bg-light-default dark:bg-white  rounded-2xl border border-white/50 justify-center items-center flex self-start mx-4 md:mx-0">
              <div className="text-center text-[#eae8f0] dark:text-light-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.875rem] md:leading-normal">
                {" "}
                <div className="flex items-center gap-1 md:gap-2">
                  {" "}
                  <FontAwesomeIcon icon={faPersonRunning} />
                  {playersPlayed}
                </div>{" "}
              </div>
            </div>
          </div>
        )}
        <div className="grow shrink basis-0 h-[3.375rem] w-[10.25rem] md:h-[4.4rem] px-6 md:px-10 py-5 bg-white/70 dark:bg-white/5 rounded-2xl border border-white/50 justify-center items-center flex">
          <div className="text-center dark:text-dark-90 text-light-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.875rem] md:leading-normal break-words">
            {teamName}
          </div>
        </div>
        {alignPoints === "right" && (
          <div className="flex md:gap-2">
            <div className="w-[3.375rem] h-[3.375rem] md:h-[4.4rem] md:px-10 md:py-6 bg-light-default dark:bg-white  rounded-2xl border border-white/50 justify-center items-center flex self-start mx-4 md:mx-0">
              <div className="text-center text-[#eae8f0] dark:text-light-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.875rem] md:leading-normal">
                {" "}
                <div className="flex items-center gap-1 md:gap-2">
                  {" "}
                  <FontAwesomeIcon icon={faPersonRunning} />
                  {playersPlayed}
                </div>{" "}
              </div>
            </div>
            <div className="w-[3.375rem] h-[3.375rem] md:h-[4.4rem] md:px-10 md:py-6 bg-light-default dark:bg-white  rounded-2xl border border-white/50 justify-center items-center flex self-start mx-4 md:mx-0">
              <div className="text-center text-[#eae8f0] dark:text-light-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.875rem] md:leading-normal">
                {" "}
                {totalPoints}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
