import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FplTeamResponse } from "@/models/fplTeamResponse";
import { LeagueData } from "@/models/league";
import StyledButton from "@/components/common/StyledButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { setCookie } from "@/lib/cookies";
import { Button } from "@headlessui/react";

export const Route = createFileRoute("/team/$teamId")({
  component: TeamPage,
});

function TeamPage() {
  const navigate = useNavigate();
  const { teamId } = Route.useParams();
  const [leagueData, setLeagueData] = useState<LeagueData[] | null>(null);
  const [error, setError] = useState("");

  const fetchLeagueID = async (teamID: number) => {
    try {
      const response = await fetch(`/api/fetchLeagueID?teamId=${teamID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team data");
      }
      const data = await response.json();
      setError(""); // Clear any previous errors
      return data;
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("Failed to fetch team data. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    if (!teamId) {
      setError("Team ID is missing.");
      return;
    }

    const fetchData = async () => {
      try {
        const data: FplTeamResponse = await fetchLeagueID(Number(teamId));
        if (data) {
          const leaguePromises = data.entry.league_set.map(async (league) => {
            const response = await fetch(
              `/api/fetchLeagueDetails?leagueID=${league}`,
            );
            if (!response.ok) {
              throw new Error("Failed to fetch league data");
            }
            return await response.json();
          });
          const leagueResponses = await Promise.all(leaguePromises);
          setLeagueData(leagueResponses); // Set all league data
        } else {
          setError("Failed to fetch team data.");
        }
      } catch (error) {
        console.error("Error in fetching data:", error);
        setError("An unexpected error occurred.");
      }
    };

    fetchData();
  }, [teamId]);

  const handleLeagueSelection = (leagueID: number) => {
    try {
      setCookie("teamID", String(teamId), 7);
      setCookie("leagueID", String(leagueID), 7);

      // Navigate to the scoring page
      navigate({ to: `/scoring/${leagueID}/${teamId}` });
    } catch (error) {
      console.error("Error setting cookies:", error);
      setError("Failed to set cookies. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="w-full md:h-[330px] flex-col justify-start items-center gap-10 inline-flex my-auto">
        <div className="self-stretch text-center text-light-80 dark:text-dark-80 text-sm font-medium font-roobertMono uppercase leading-3 tracking-wide">
          SELECT A LEAGUE
        </div>
        <div className="md:w-1/3 self-stretch md:self-auto md:h-[17rem] flex-col justify-start items-center gap-2 flex">
          {!leagueData && !error && <LoadingSpinner />}
          {leagueData?.map((league, index) => (
            <Button
              key={index}
              className="self-stretch px-10 py-6 md:py-8 h-[3.875rem] md:h-[5.4rem] bg-black/5 dark:bg-black/20 rounded-2xl shadow-custom-light justify-center items-center inline-flex"
              onClick={() => handleLeagueSelection(league.league.id)}
            >
              <div className="text-center text-light-90 dark:text-dark-90 text-base md:text-[1.625rem] font-semibold font-roobert leading-[.9em] md:leading-normal">
                {league.league.name}
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <StyledButton
          label={"BACK TO HOMEPAGE"}
          type={"submit"}
          onClick={() => navigate({ to: "/" })}
        />
      </div>
    </div>
  );
}
