import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LeagueTable from "../LeagueTable";
import { LeagueData } from "@/models/league";

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
    ],
    // Alpha wins GW1-4, Beta wins GW5 -> Alpha: 4W-0D-1L, 60 for/40 against, 12 pts.
    matches: [1, 2, 3, 4].map((event) => ({
      event,
      finished: true,
      started: true,
      league_entry_1: 1,
      league_entry_1_points: 15,
      league_entry_2: 2,
      league_entry_2_points: 5,
      winning_league_entry: 1,
      winning_method: null,
    })).concat([{
      event: 5,
      finished: true,
      started: true,
      league_entry_1: 1,
      league_entry_1_points: 0,
      league_entry_2: 2,
      league_entry_2_points: 20,
      winning_league_entry: 2,
      winning_method: null,
    }]),
    standings: [],
  };
}

describe("LeagueTable", () => {
  it("renders rows sorted by computed rank, best team first", () => {
    render(<LeagueTable leagueData={makeLeagueData()} teamsScoringData={{}} currentGameweek={6} currentGameweekFinished={true} onTeamClick={vi.fn()} />);

    const rows = screen.getAllByRole("row").slice(1); // skip header row
    expect(rows[0]).toHaveTextContent("Alpha");
    expect(rows[1]).toHaveTextContent("Beta");
  });

  it("shows P/W/D/L and total columns", () => {
    render(<LeagueTable leagueData={makeLeagueData()} teamsScoringData={{}} currentGameweek={6} currentGameweekFinished={true} onTeamClick={vi.fn()} />);

    const alphaRow = screen.getByText("Alpha").closest("tr")!;
    expect(alphaRow).toHaveTextContent("5"); // played
    expect(alphaRow).toHaveTextContent("4"); // won
    expect(alphaRow).toHaveTextContent("12"); // total
  });

  it("calls onTeamClick with the league_entry id (not entry_id) when a row is clicked", () => {
    const onTeamClick = vi.fn();
    render(<LeagueTable leagueData={makeLeagueData()} teamsScoringData={{}} currentGameweek={6} currentGameweekFinished={true} onTeamClick={onTeamClick} />);

    fireEvent.click(screen.getByText("Alpha").closest("tr")!);
    expect(onTeamClick).toHaveBeenCalledWith(1);
  });

  it("highlights the viewer's own team by matching teamID against entry_id", () => {
    render(<LeagueTable leagueData={makeLeagueData()} teamsScoringData={{}} currentGameweek={6} currentGameweekFinished={true} teamID={200} onTeamClick={vi.fn()} />);

    const betaRow = screen.getByText("Beta").closest("tr")!;
    const alphaRow = screen.getByText("Alpha").closest("tr")!;
    expect(betaRow.className).toMatch(/bg-black\/10/);
    expect(alphaRow.className).not.toMatch(/bg-black\/10/);
  });
});
