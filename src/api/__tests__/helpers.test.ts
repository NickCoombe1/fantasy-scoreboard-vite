import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test fetchJson which is not directly exported,
// but we can test the exported helper functions that wrap it.
// We'll mock global fetch to test the behavior.

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchJson (via exported helpers)", () => {
  it("returns parsed JSON on successful response", async () => {
    const mockData = { current_event: 10 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    );

    // Import after stubbing fetch
    const { fetchGameWeekDetails } = await import("../helpers");
    const result = await fetchGameWeekDetails();
    expect(result).toEqual(mockData);
  });

  it("throws an error when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      }),
    );

    const { fetchGameWeekDetails } = await import("../helpers");
    await expect(fetchGameWeekDetails()).rejects.toThrow("API error: Not Found");
  });

  it("calls the correct URL for each helper", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    const helpers = await import("../helpers");

    await helpers.fetchGameWeekDetails();
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchGameWeekDetails");

    await helpers.fetchLeagueData(42);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchLeagueDetails?leagueID=42");

    await helpers.fetchScoringData(10, 5);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchScoringData?teamID=10&gameweek=5");

    await helpers.fetchBootStrap();
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchBootStrap");

    await helpers.fetchLeagueID(7);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchLeagueID?teamId=7");

    await helpers.fetchGameWeekFixtures(3);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchGameWeekFixtures?gameweek=3");

    await helpers.fetchWeeklyScoring(8);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchWeeklyScoring?gameweek=8");

    await helpers.fetchWeeklyTeam(12, 6);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/fetchWeeklyTeam?teamID=12&gameweek=6");
  });
});
