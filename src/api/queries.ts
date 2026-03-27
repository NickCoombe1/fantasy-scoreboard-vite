import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGameWeekDetails,
  fetchLeagueData,
  fetchScoringData,
  fetchBootStrap,
  fetchLeagueID,
  fetchGameWeekFixtures,
  fetchWeeklyScoring,
  fetchWeeklyTeam,
  fetchLeagueScoring,
} from "@/api/helpers";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export function useGameWeekDetails() {
  return useQuery({
    queryKey: ["gameWeekDetails"],
    queryFn: fetchGameWeekDetails,
  });
}

export function useLeagueData(leagueId: number) {
  return useQuery({
    queryKey: ["leagueData", leagueId],
    queryFn: () => fetchLeagueData(leagueId),
    staleTime: 5 * MINUTE,
    enabled: !!leagueId,
  });
}

export function useScoringData(teamId: number, gameweek: number) {
  return useQuery({
    queryKey: ["scoringData", teamId, gameweek],
    queryFn: () => fetchScoringData(teamId, gameweek),
    staleTime: 30 * 1000,
    enabled: !!teamId && !!gameweek,
  });
}

export function useBootstrap() {
  return useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootStrap,
    staleTime: 24 * HOUR,
  });
}

export function useLeagueID(teamId: number) {
  return useQuery({
    queryKey: ["leagueID", teamId],
    queryFn: () => fetchLeagueID(teamId),
    staleTime: 24 * HOUR,
    enabled: !!teamId,
  });
}

export function useGameWeekFixtures(gameweek: number) {
  return useQuery({
    queryKey: ["gameWeekFixtures", gameweek],
    queryFn: () => fetchGameWeekFixtures(gameweek),
    enabled: !!gameweek,
  });
}

export function useWeeklyScoring(gameweek: number) {
  return useQuery({
    queryKey: ["weeklyScoring", gameweek],
    queryFn: () => fetchWeeklyScoring(gameweek),
    staleTime: 30 * 1000,
    enabled: !!gameweek,
  });
}

export function useWeeklyTeam(teamId: number, gameweek: number) {
  return useQuery({
    queryKey: ["weeklyTeam", teamId, gameweek],
    queryFn: () => fetchWeeklyTeam(teamId, gameweek),
    staleTime: 5 * MINUTE,
    enabled: !!teamId && !!gameweek,
  });
}

export function useRefreshQueries() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}

// Fetches scoring data for all teams in a league via a single batch endpoint
// Returns a Record keyed by league_entry id
export function useAllLeagueScoringData(
  leagueId: number,
  gameweek: number,
) {
  return useQuery({
    queryKey: ["allLeagueScoring", leagueId, gameweek],
    queryFn: () => fetchLeagueScoring(leagueId, gameweek),
    enabled: !!leagueId && !!gameweek,
    placeholderData: (previousData) => previousData,
    gcTime: 5 * MINUTE,
  });
}
