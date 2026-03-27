import { describe, it, expect } from "vitest";
import { processTeamData } from "../fetchScoringData";

/**
 * Performance benchmarks for processTeamData — the full server-side pipeline:
 *   mapBootstrapData (O(picks × bootstrap_elements) lookup) →
 *   calculateAutoSubs (JSON.parse/stringify deep cloning) →
 *   reduce for totals
 *
 * Uses realistic data sizes:
 *   - Bootstrap: ~700 players (real PL squad sizes)
 *   - Scoring: matching element data
 *   - Team: 15 picks (11 starters + 4 bench)
 *   - Fixtures: ~10 matches per gameweek
 */

const NUM_BOOTSTRAP_PLAYERS = 700;
const NUM_FIXTURES = 10;
const ITERATIONS = 500;

function makeRealisticData(opts: { subsNeeded: number }) {
  // Bootstrap: 700 players across 20 teams
  const elements = Array.from({ length: NUM_BOOTSTRAP_PLAYERS }, (_, i) => ({
    id: i + 1,
    web_name: `Player${i + 1}`,
    team: (i % 20) + 1,
    element_type: (i % 4) + 1, // 1=GK, 2=DEF, 3=MID, 4=FWD
    chance_of_playing_this_round: 100,
  }));

  // Scoring data for all players
  const scoringElements: Record<number, { stats: Record<string, unknown>; explain: never[] }> = {};
  for (let i = 0; i < NUM_BOOTSTRAP_PLAYERS; i++) {
    scoringElements[i + 1] = {
      stats: {
        minutes: 90,
        goals_scored: 0,
        assists: 0,
        clean_sheets: 0,
        goals_conceded: 0,
        own_goals: 0,
        penalties_saved: 0,
        penalties_missed: 0,
        yellow_cards: 0,
        red_cards: 0,
        saves: 0,
        bonus: 0,
        bps: 0,
        influence: 0,
        creativity: 0,
        threat: 0,
        ict_index: 0,
        starts: 1,
        expected_goals: 0,
        expected_assists: 0,
        expected_goal_involvements: 0,
        expected_goals_conceded: 0,
        total_points: 5,
        in_dreamteam: false,
        chance_of_playing_next_round: 100,
        chance_of_playing_this_round: 100,
      },
      explain: [],
    };
  }

  // Pick 15 players with correct positions: GK, 4 DEF, 4 MID, 2 FWD + bench
  // Use element IDs that match bootstrap element_types
  const pickElements = [
    { element: 1, position: 1, element_type: 1 },   // GK
    { element: 2, position: 2, element_type: 2 },   // DEF
    { element: 6, position: 3, element_type: 2 },   // DEF
    { element: 10, position: 4, element_type: 2 },  // DEF
    { element: 14, position: 5, element_type: 2 },  // DEF
    { element: 3, position: 6, element_type: 3 },   // MID
    { element: 7, position: 7, element_type: 3 },   // MID
    { element: 11, position: 8, element_type: 3 },  // MID
    { element: 15, position: 9, element_type: 3 },  // MID
    { element: 4, position: 10, element_type: 4 },  // FWD
    { element: 8, position: 11, element_type: 4 },  // FWD
    // Bench
    { element: 5, position: 12, element_type: 1 },  // GK
    { element: 18, position: 13, element_type: 2 }, // DEF
    { element: 19, position: 14, element_type: 3 }, // MID
    { element: 20, position: 15, element_type: 4 }, // FWD
  ];

  const picks = pickElements.map((p, i) => ({
    id: i + 1,
    element: p.element,
    position: p.position,
    multiplier: 1,
  }));

  // Mark some starters as not played to trigger subs
  for (let i = 0; i < opts.subsNeeded && i < 4; i++) {
    const starterElement = picks[9 - i]!.element;
    scoringElements[starterElement]!.stats.minutes = 0;
  }

  // Fixtures: 10 matches, all finished
  const fixtures = Array.from({ length: NUM_FIXTURES }, (_, i) => ({
    team_a: i * 2 + 1,
    team_h: i * 2 + 2,
    finished: true,
    started: true,
  }));

  return {
    bootstrap: { elements } as never,
    scoring: { elements: scoringElements } as never,
    teamData: { picks },
    fixtures,
  };
}

describe("processTeamData performance (full pipeline)", () => {
  it(`no subs × ${ITERATIONS} iterations (700 bootstrap players)`, async () => {
    const data = makeRealisticData({ subsNeeded: 0 });

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await processTeamData(data.bootstrap, data.scoring, data.teamData, data.fixtures);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  No subs:  ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(50);
  });

  it(`3 subs × ${ITERATIONS} iterations (700 bootstrap players)`, async () => {
    const data = makeRealisticData({ subsNeeded: 3 });

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await processTeamData(data.bootstrap, data.scoring, data.teamData, data.fixtures);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  3 subs:   ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(50);
  });

  it(`league scenario: 8 teams × processTeamData (simulates league page)`, async () => {
    const teamDatas = Array.from({ length: 8 }, (_, i) => {
      const data = makeRealisticData({ subsNeeded: i % 3 });
      // Vary team picks slightly per team
      data.teamData.picks = data.teamData.picks.map((p, j) => ({
        ...p,
        element: p.element + i * 20,
      }));
      return data;
    });

    const start = performance.now();
    for (const data of teamDatas) {
      await processTeamData(data.bootstrap, data.scoring, data.teamData, data.fixtures);
    }
    const elapsed = performance.now() - start;

    const perTeam = elapsed / 8;
    console.log(`  8 teams:  ${elapsed.toFixed(0)}ms total, ${perTeam.toFixed(3)}ms/team`);
    expect(elapsed).toBeLessThan(500);
  });
});
