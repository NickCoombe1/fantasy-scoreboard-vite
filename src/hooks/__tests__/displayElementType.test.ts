import { describe, it, expect } from "vitest";
import getElementTypeShortName from "../displayElementType";
import { ElementType } from "@/models/playerData";

describe("getElementTypeShortName", () => {
  it("returns GKP for Goalkeeper", () => {
    expect(getElementTypeShortName(ElementType.Goalkeeper)).toBe("GKP");
  });

  it("returns DEF for Defender", () => {
    expect(getElementTypeShortName(ElementType.Defender)).toBe("DEF");
  });

  it("returns MID for Midfielder", () => {
    expect(getElementTypeShortName(ElementType.Midfielder)).toBe("MID");
  });

  it("returns FWD for Forward", () => {
    expect(getElementTypeShortName(ElementType.Forward)).toBe("FWD");
  });

  it("returns Unknown for unrecognized value", () => {
    expect(getElementTypeShortName(99 as ElementType)).toBe("Unknown");
  });
});
