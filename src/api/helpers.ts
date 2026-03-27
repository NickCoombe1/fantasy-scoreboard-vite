import type { GameStatusData } from "@/models/game";
import type { LeagueData } from "@/models/league";
import type { ScoringData } from "@/models/scoringData";
import type { FplBootstrapResponse } from "@/models/fplBootstrapResponse";
import type { FplTeamResponse } from "@/models/fplTeamResponse";
import type { Fixtures } from "@/models/fplFixtureResponse";
import type { PlayerDataResponse } from "@/models/playerDataResponse";
import type { FplTeamPicksResponse } from "@/models/fplTeamPicksResponse";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

export const fetchGameWeekDetails = () =>
  fetchJson<GameStatusData>("/api/fetchGameWeekDetails");

export const fetchLeagueData = (leagueID: number) =>
  fetchJson<LeagueData>(`/api/fetchLeagueDetails?leagueID=${leagueID}`);

export const fetchScoringData = (teamID: number, gameweek: number) =>
  fetchJson<ScoringData>(`/api/fetchScoringData?teamID=${teamID}&gameweek=${gameweek}`);

export const fetchBootStrap = () =>
  fetchJson<FplBootstrapResponse>("/api/fetchBootStrap");

export const fetchLeagueID = (teamId: number) =>
  fetchJson<FplTeamResponse>(`/api/fetchLeagueID?teamId=${teamId}`);

export const fetchGameWeekFixtures = (gameweek: number) =>
  fetchJson<Fixtures>(`/api/fetchGameWeekFixtures?gameweek=${gameweek}`);

export const fetchWeeklyScoring = (gameweek: number) =>
  fetchJson<PlayerDataResponse>(`/api/fetchWeeklyScoring?gameweek=${gameweek}`);

export const fetchWeeklyTeam = (teamID: number, gameweek: number) =>
  fetchJson<FplTeamPicksResponse>(`/api/fetchWeeklyTeam?teamID=${teamID}&gameweek=${gameweek}`);

export const fetchLeagueScoring = (leagueID: number, gameweek: number) =>
  fetchJson<Record<number, ScoringData>>(`/api/fetchLeagueScoring?leagueID=${leagueID}&gameweek=${gameweek}`);
