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
    matches: [],
    standings: [
      { last_rank: 2, league_entry: 2, matches_drawn: 1, matches_lost: 3, matches_played: 5, matches_won: 1, points_against: 50, points_for: 40, rank: 2, rank_sort: 2, total: 4 },
      { last_rank: 1, league_entry: 1, matches_drawn: 0, matches_lost: 1, matches_played: 5, matches_won: 4, points_against: 30, points_for: 60, rank: 1, rank_sort: 1, total: 12 },
    ],
  };
}

describe("LeagueTable", () => {
  it("renders rows sorted by rank_sort, not standings array order", () => {
    render(<LeagueTable leagueData={makeLeagueData()} onTeamClick={vi.fn()} />);

    const rows = screen.getAllByRole("row").slice(1); // skip header row
    expect(rows[0]).toHaveTextContent("Alpha");
    expect(rows[1]).toHaveTextContent("Beta");
  });

  it("shows P/W/D/L and total columns", () => {
    render(<LeagueTable leagueData={makeLeagueData()} onTeamClick={vi.fn()} />);

    const alphaRow = screen.getByText("Alpha").closest("tr")!;
    expect(alphaRow).toHaveTextContent("5"); // played
    expect(alphaRow).toHaveTextContent("4"); // won
    expect(alphaRow).toHaveTextContent("12"); // total
  });

  it("calls onTeamClick with the league_entry id (not entry_id) when a row is clicked", () => {
    const onTeamClick = vi.fn();
    render(<LeagueTable leagueData={makeLeagueData()} onTeamClick={onTeamClick} />);

    fireEvent.click(screen.getByText("Alpha").closest("tr")!);
    expect(onTeamClick).toHaveBeenCalledWith(1);
  });

  it("highlights the viewer's own team by matching teamID against entry_id", () => {
    render(<LeagueTable leagueData={makeLeagueData()} teamID={200} onTeamClick={vi.fn()} />);

    const betaRow = screen.getByText("Beta").closest("tr")!;
    const alphaRow = screen.getByText("Alpha").closest("tr")!;
    expect(betaRow.className).toMatch(/bg-black\/10/);
    expect(alphaRow.className).not.toMatch(/bg-black\/10/);
  });
});
