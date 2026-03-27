import { describe, it, expect } from "vitest";
import { calculateAutoSubs } from "../calculateAutoSubs";
import { ElementType } from "@/models/playerData";
import { PlayerPick } from "@/models/playerPick";

function makePick(overrides: Partial<PlayerPick> & { element: number; position: number; fieldPosition: ElementType }): PlayerPick {
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

// Standard 4-4-2 team: GK(1), DEF(2-5), MID(6-9), FWD(10-11), bench: GK(12), DEF(13), MID(14), FWD(15)
function makeStandard442(): PlayerPick[] {
  return [
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
}

describe("calculateAutoSubs", () => {
  it("returns team unchanged when all starters have played", () => {
    const team = makeStandard442();
    const result = calculateAutoSubs(team);

    const starters = result.filter((p) => p.position < 12);
    expect(starters).toHaveLength(11);
    expect(starters.every((p) => !p.willBeAutosubbed)).toBe(true);
  });

  it("subs in first eligible bench player when a starter did not play (game finished)", () => {
    const team = makeStandard442();
    // Forward (element 10) didn't play, game finished
    team[9]!.hasPlayed = false;

    const result = calculateAutoSubs(team);

    // The starter should be marked as subbed out
    const subbedOut = result.find((p) => p.element === 10);
    expect(subbedOut!.isSub).toBe(true);
    expect(subbedOut!.willBeAutosubbed).toBe(true);

    // First eligible bench player (element 13, defender) should be subbed in
    const subbedIn = result.find((p) => p.element === 13);
    expect(subbedIn!.isSub).toBe(false);
    expect(subbedIn!.willBeAutosubbed).toBe(true);
  });

  it("blocks sub that would violate minimum formation requirements", () => {
    const team = makeStandard442();
    // Make it 3-4-3 formation: change one defender to forward
    // DEF(2-4), FWD(5), MID(6-9), FWD(10-11) = 3 DEF, 4 MID, 3 FWD
    team[4]!.fieldPosition = ElementType.Forward; // position 5 is now a forward

    // Now a defender (element 2) didn't play
    team[1]!.hasPlayed = false;

    // Bench has: GK(12), DEF(13), MID(14), FWD(15)
    // First bench (GK) can't come on (max 1 GK). Second bench (DEF) can.
    const result = calculateAutoSubs(team);

    const subbedOut = result.find((p) => p.element === 2);
    expect(subbedOut!.isSub).toBe(true);

    // DEF (element 13) should be the replacement to maintain 3 defenders
    const subbedIn = result.find((p) => p.element === 13);
    expect(subbedIn!.isSub).toBe(false);
    expect(subbedIn!.willBeAutosubbed).toBe(true);
  });

  it("blocks GK sub that would exceed max 1 goalkeeper", () => {
    const team = makeStandard442();
    // A midfielder (element 6) didn't play
    team[5]!.hasPlayed = false;

    // Move bench GK to first bench position to test it gets skipped
    // Bench is already: GK(12), DEF(13), MID(14), FWD(15)
    const result = calculateAutoSubs(team);

    // Bench GK (element 12) should NOT be subbed in (would make 2 GKs)
    const benchGK = result.find((p) => p.element === 12);
    expect(benchGK!.isSub).toBe(true); // still on bench

    // DEF (element 13) should be subbed in instead
    const subbedIn = result.find((p) => p.element === 13);
    expect(subbedIn!.isSub).toBe(false);
    expect(subbedIn!.willBeAutosubbed).toBe(true);
  });

  it("subs in for injured starter who has not played", () => {
    const team = makeStandard442();
    team[9]!.isInjured = true;
    team[9]!.hasPlayed = false;

    const result = calculateAutoSubs(team);

    const injured = result.find((p) => p.element === 10);
    expect(injured!.isSub).toBe(true);
    expect(injured!.willBeAutosubbed).toBe(true);
  });

  it("does not sub when all bench players are injured", () => {
    const team = makeStandard442();
    team[9]!.hasPlayed = false; // starter didn't play

    // All bench players injured
    team[11]!.isInjured = true;
    team[12]!.isInjured = true;
    team[13]!.isInjured = true;
    team[14]!.isInjured = true;

    const result = calculateAutoSubs(team);

    const starter = result.find((p) => p.element === 10);
    expect(starter!.willBeAutosubbed).toBe(false);
  });

  it("does not sub when all bench players did not play and games are finished", () => {
    const team = makeStandard442();
    team[9]!.hasPlayed = false; // starter didn't play

    // All bench players also didn't play with finished games
    team[11]!.hasPlayed = false;
    team[12]!.hasPlayed = false;
    team[13]!.hasPlayed = false;
    team[14]!.hasPlayed = false;

    const result = calculateAutoSubs(team);

    const starter = result.find((p) => p.element === 10);
    expect(starter!.willBeAutosubbed).toBe(false);
  });

  it("handles multiple subs correctly", () => {
    const team = makeStandard442();
    // Two forwards didn't play
    team[9]!.hasPlayed = false;
    team[10]!.hasPlayed = false;

    const result = calculateAutoSubs(team);

    const fwd10 = result.find((p) => p.element === 10);
    const fwd11 = result.find((p) => p.element === 11);
    expect(fwd10!.isSub).toBe(true);
    expect(fwd11!.isSub).toBe(true);

    // Two bench players should have been subbed in
    const subbedIn = result.filter((p) => p.willBeAutosubbed && !p.isSub);
    expect(subbedIn.length).toBe(2);
  });

  it("bench player whose game has not finished is eligible for sub", () => {
    const team = makeStandard442();
    team[9]!.hasPlayed = false; // starter didn't play

    // All bench players' games not finished, they haven't played yet
    team[11]!.hasPlayed = false;
    team[11]!.gameStatus = { isFinished: false, isInProgress: false };
    team[12]!.hasPlayed = false;
    team[12]!.gameStatus = { isFinished: false, isInProgress: false };
    team[13]!.hasPlayed = false;
    team[13]!.gameStatus = { isFinished: false, isInProgress: false };
    team[14]!.hasPlayed = false;
    team[14]!.gameStatus = { isFinished: false, isInProgress: false };

    const result = calculateAutoSubs(team);

    // A bench player should be subbed in since their game hasn't finished
    const subbedOut = result.find((p) => p.element === 10);
    expect(subbedOut!.isSub).toBe(true);
    expect(subbedOut!.willBeAutosubbed).toBe(true);
  });

  it("does not sub starter whose game is not finished even if they have not played", () => {
    const team = makeStandard442();
    // Starter hasn't played but game is still in progress
    team[9]!.hasPlayed = false;
    team[9]!.gameStatus = { isFinished: false, isInProgress: true };

    const result = calculateAutoSubs(team);

    const starter = result.find((p) => p.element === 10);
    expect(starter!.isSub).toBe(false);
    expect(starter!.willBeAutosubbed).toBe(false);
  });

  it("mutates the input array (documents current behavior)", () => {
    const team = makeStandard442();
    team[9]!.hasPlayed = false;

    const result = calculateAutoSubs(team);
    expect(result).toBe(team); // same reference
  });
});
