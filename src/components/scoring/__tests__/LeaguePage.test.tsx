import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import LeaguePage from "../LeaguePage";
import { LeagueData } from "@/models/league";
import { ScoringData } from "@/models/scoringData";

function makeLeagueData(): LeagueData {
  return {
    league: {
      admin_entry: 1,
      closed: false,
      draft_dt: "",
      draft_pick_time_limit: 0,
      draft_status: "",
      draft_tz_show: "",
      id: 1,
      ko_rounds: 0,
      make_code_public: false,
      max_entries: 0,
      min_entries: 0,
      name: "Test League",
      scoring: "",
      start_event: 1,
      stop_event: 38,
      trades: "",
      transaction_mode: "",
      variety: "",
    },
    league_entries: [
      { entry_id: 100, entry_name: "Alpha", id: 1, joined_time: "", player_first_name: "A", player_last_name: "One", short_name: "A1", waiver_pick: 1 },
      { entry_id: 200, entry_name: "Beta", id: 2, joined_time: "", player_first_name: "B", player_last_name: "Two", short_name: "B2", waiver_pick: 2 },
      { entry_id: 300, entry_name: "Gamma", id: 3, joined_time: "", player_first_name: "G", player_last_name: "Three", short_name: "G3", waiver_pick: 3 },
      { entry_id: 400, entry_name: "Delta", id: 4, joined_time: "", player_first_name: "D", player_last_name: "Four", short_name: "D4", waiver_pick: 4 },
    ],
    matches: [
      { event: 1, finished: false, league_entry_1: 1, league_entry_1_points: 10, league_entry_2: 2, league_entry_2_points: 20, started: true, winning_league_entry: null, winning_method: null },
      { event: 1, finished: false, league_entry_1: 3, league_entry_1_points: 5, league_entry_2: 4, league_entry_2_points: 15, started: true, winning_league_entry: null, winning_method: null },
    ],
    standings: [],
  };
}

function makeScoringData(): Record<number, ScoringData> {
  return {
    1: { totalPoints: 10, playersPlayed: 5, picks: [] },
    2: { totalPoints: 20, playersPlayed: 6, picks: [] },
    3: { totalPoints: 5, playersPlayed: 4, picks: [] },
    4: { totalPoints: 15, playersPlayed: 5, picks: [] },
  };
}

describe("LeaguePage highlight/scroll on team click", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("scrolls the matchup containing the highlighted team into view", () => {
    render(
      <LeaguePage
        gameweek={1}
        leagueData={makeLeagueData()}
        teamsScoringData={makeScoringData()}
        highlightedTeamId={4} // in the second matchup (Gamma vs Delta)
      />,
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth", block: "center" }),
    );
  });

  it("does not scroll when no team is highlighted", () => {
    render(
      <LeaguePage
        gameweek={1}
        leagueData={makeLeagueData()}
        teamsScoringData={makeScoringData()}
        highlightedTeamId={null}
      />,
    );

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("does not throw when the highlighted team isn't in the current gameweek's matchups", () => {
    expect(() =>
      render(
        <LeaguePage
          gameweek={1}
          leagueData={makeLeagueData()}
          teamsScoringData={makeScoringData()}
          highlightedTeamId={9999}
        />,
      ),
    ).not.toThrow();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
