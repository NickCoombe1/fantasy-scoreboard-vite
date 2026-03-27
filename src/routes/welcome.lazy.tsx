import React, { useEffect, useState } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import TitleDesktop from "@/components/svg/TitleDesktop";
import TitleMobile from "@/components/svg/TitleMobile";
import ScoreboardDesktop from "@/components/svg/ScoreboardDesktop";
import ScoreboardMobile from "@/components/svg/ScoreboardMobile";
import About from "@/components/svg/About";
import StyledButton from "@/components/common/StyledButton";
import { Modal, useDialog } from "@/components/common/Modal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { getCookie, setCookie } from "@/lib/cookies";

export const Route = createLazyFileRoute("/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [teamInput, setTeamInput] = useState("");
  const [error, setError] = useState("");
  const { isOpen, openDialog, closeDialog } = useDialog();
  const [loading, setLoading] = useState(false);

  // Check cookies and redirect if teamID and leagueID are present
  useEffect(() => {
    const teamID = getCookie("teamID");
    const leagueID = getCookie("leagueID");

    // Check if user came from another page in your site
    const referrer = document.referrer;
    const isInternalReferrer =
      referrer && new URL(referrer).origin === window.location.origin;

    if (!isInternalReferrer && teamID && leagueID) {
      setLoading(true);
      navigate({ to: `/scoring/${leagueID}/${teamID}` });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const match = teamInput.match(/entry\/(\d+)/);
    const teamID = match ? match[1] : teamInput;

    if (!teamID || isNaN(Number(teamID))) {
      setError("Please enter a valid Team ID or Points Page URL.");
      return;
    }

    // Save teamID in cookies (30 days)
    setCookie("teamID", teamID, 30);
    navigate({ to: `/team/${teamID}` });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      {loading && <LoadingSpinner />}
      {!loading && (
        <>
          <div className="w-full max-w-4xl h-80 md:h-[461.43px] flex-col justify-start items-center gap-24 md:gap-30 inline-flex mb-[6rem]">
            <div className="self-stretch flex-col justify-start items-center md:gap-20 gap-12 flex ">
              <div className="self-stretch text-center text-light-80 dark:text-dark-80 md:text-sm font-medium font-roobertMono uppercase md:leading-3 md:tracking-wide text-xs leading-[10.80px] tracking-tight">
                WELCOME TO THE
              </div>
              <div className="mx-auto h-[63.71px] relative md:hidden">
                <div className="h-[39.16px] mx-auto">
                  {" "}
                  <TitleMobile mode={theme} />
                </div>
                <div className="h-[28.91px] left-[65px] top-[30.80px] absolute">
                  <div className="w-[129.28px] h-[17.04px] left-[12.61px] top-[2px] absolute">
                    {" "}
                    <ScoreboardMobile />
                  </div>
                </div>
                <div className="left-[315.15px] top-[28.17px] absolute text-center dark:text-white text-black text-xl font-normal font-hexaframe leading-[17.98px]">
                  ©
                </div>
              </div>
              <div className="mx-auto h-[134.43px] relative hidden md:block">
                <div className="mx-auto h-[82.64px]">
                  {" "}
                  <TitleDesktop mode={theme} />
                </div>
                <div className="w-[338px] h-[61px] left-[165px] top-[70.43px] absolute">
                  <div className="w-[272.79px] h-[35.95px] absolute">
                    {" "}
                    <ScoreboardDesktop />
                  </div>
                </div>
                <div className="left-[665px] top-[59.43px] absolute text-center dark:text-white text-black  text-[42.16px] font-normal font-hexaframe leading-[37.94px]">
                  ©
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="h-[113px] flex-col justify-start items-center gap-8 flex">
                <div className="justify-start items-start gap-1 inline-flex">
                  <div className="text-center text-light-90 dark:text-dark-90 text-sm font-medium leading-normal font-roobert tracking-tight md:leading-3 inline-block">
                    Enter your Team ID or your Points Page URL to get started{" "}
                    <span
                      className="inline-block align-middle pb-1 md:pb-0.5 pl-0.5"
                      onClick={openDialog}
                    >
                      <About mode={theme} height={16} width={16} />
                    </span>
                  </div>
                </div>
                <div className="self-stretch px-8 py-5 bg-black/5 dark:bg-black/20 rounded-lg shadow-custom-light justify-center items-center gap-2.5 inline-flex">
                  <input
                    type="text"
                    placeholder="Team ID or Points Page URL"
                    onChange={(e) => setTeamInput(e.target.value)}
                    className="w-full text-center text-light-60 dark:text-dark-60 text-base font-normal font-roobert leading-normal tracking-tight bg-transparent  border-0 focus:ring-0 focus:outline-none"
                  />
                </div>{" "}
                {error && (
                  <p className="text-sm text-light-red dark:text-dark-red text-left">
                    {error}
                  </p>
                )}
                <div>
                  <StyledButton label={"GET IN"} type={"submit"} />
                </div>
              </div>{" "}
            </form>
          </div>
          <Modal isOpen={isOpen} closeDialog={closeDialog} />
        </>
      )}
    </div>
  );
}
