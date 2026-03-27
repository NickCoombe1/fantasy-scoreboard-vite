import { describe, it, expect } from "vitest";
import { calculateAutoSubs } from "../calculateAutoSubs";
import { ElementType } from "@/models/playerData";
import { PlayerPick } from "@/models/playerPick";

/**
 * Performance benchmarks for calculateAutoSubs.
 * Measures computation time with realistic team data to track
 * improvements when refactoring (e.g. removing JSON.parse/stringify deep cloning).
 */

const ITERATIONS = 1000;

function makePick(
  overrides: Partial<PlayerPick> & { element: number; position: number; fieldPosition: ElementType },
): PlayerPick {
  const { element, position, fieldPosition, ...rest } = overrides;
  return {
    id: element,
    element,
    position,
    multiplier: 1,
    isSub: position > 11,
    points: 5,
    name: `Player ${element}`,
    hasPlayed: true,
    willBeAutosubbed: false,
    isInjured: false,
    wasSubbedOn: false,
    yellowCarded: false,
    redCarded: false,
    fieldPosition,
    gameStatus: { isFinished: true, isInProgress: false },
    ...rest,
  };
}

function makeTeamWithSubs(numSubsNeeded: number): PlayerPick[] {
  const team = [
    makePick({ element: 1, position: 1, fieldPosition: ElementType.Goalkeeper }),
    makePick({ element: 2, position: 2, fieldPosition: ElementType.Defender }),
    makePick({ element: 3, position: 3, fieldPosition: ElementType.Defender }),
    makePick({ element: 4, position: 4, fieldPosition: ElementType.Defender }),
    makePick({ element: 5, position: 5, fieldPosition: ElementType.Defender }),
    makePick({ element: 6, position: 6, fieldPosition: ElementType.Midfielder }),
    makePick({ element: 7, position: 7, fieldPosition: ElementType.Midfielder }),
    makePick({ element: 8, position: 8, fieldPosition: ElementType.Midfielder }),
    makePick({ element: 9, position: 9, fieldPosition: ElementType.Midfielder }),
    makePick({ element: 10, position: 10, fieldPosition: ElementType.Forward }),
    makePick({ element: 11, position: 11, fieldPosition: ElementType.Forward }),
    // Bench
    makePick({ element: 12, position: 12, fieldPosition: ElementType.Goalkeeper }),
    makePick({ element: 13, position: 13, fieldPosition: ElementType.Defender }),
    makePick({ element: 14, position: 14, fieldPosition: ElementType.Midfielder }),
    makePick({ element: 15, position: 15, fieldPosition: ElementType.Forward }),
  ];

  // Mark starters as not played to trigger auto-sub logic
  for (let i = 0; i < numSubsNeeded && i < 4; i++) {
    // Skip subs for positions that would be hard to replace (GK)
    const starterIndex = 9 - i; // Start from MID/FWD positions
    team[starterIndex]!.hasPlayed = false;
  }

  return team;
}

function deepCloneTeam(team: PlayerPick[]): PlayerPick[] {
  return JSON.parse(JSON.stringify(team));
}

describe("calculateAutoSubs performance", () => {
  it(`no subs needed × ${ITERATIONS} iterations`, () => {
    const baseTeam = makeTeamWithSubs(0);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const team = deepCloneTeam(baseTeam);
      calculateAutoSubs(team);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  No subs:      ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(10); // sanity check
  });

  it(`1 sub needed × ${ITERATIONS} iterations`, () => {
    const baseTeam = makeTeamWithSubs(1);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const team = deepCloneTeam(baseTeam);
      calculateAutoSubs(team);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  1 sub:        ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(10);
  });

  it(`3 subs needed × ${ITERATIONS} iterations`, () => {
    const baseTeam = makeTeamWithSubs(3);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const team = deepCloneTeam(baseTeam);
      calculateAutoSubs(team);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  3 subs:       ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(10);
  });

  it(`worst case: 4 subs needed × ${ITERATIONS} iterations`, () => {
    const baseTeam = makeTeamWithSubs(4);

    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      const team = deepCloneTeam(baseTeam);
      calculateAutoSubs(team);
    }
    const elapsed = performance.now() - start;

    const perCall = elapsed / ITERATIONS;
    console.log(`  4 subs (max): ${elapsed.toFixed(0)}ms total, ${perCall.toFixed(3)}ms/call`);
    expect(perCall).toBeLessThan(10);
  });
});
