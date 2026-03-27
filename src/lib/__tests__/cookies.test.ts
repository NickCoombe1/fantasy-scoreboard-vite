import { describe, it, expect, beforeEach } from "vitest";
import { getCookie, setCookie, deleteCookie } from "../cookies";

describe("cookies (localStorage-backed)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getCookie", () => {
    it("returns the value of an existing item", () => {
      localStorage.setItem("testKey", "testValue");
      expect(getCookie("testKey")).toBe("testValue");
    });

    it("returns undefined when item does not exist", () => {
      expect(getCookie("nonexistent")).toBeUndefined();
    });

    it("returns correct value when multiple items exist", () => {
      localStorage.setItem("a", "1");
      localStorage.setItem("b", "2");
      expect(getCookie("a")).toBe("1");
      expect(getCookie("b")).toBe("2");
    });
  });

  describe("setCookie", () => {
    it("sets an item with the given name and value", () => {
      setCookie("myKey", "myValue", 7);
      expect(getCookie("myKey")).toBe("myValue");
    });
  });

  describe("deleteCookie", () => {
    it("removes an item", () => {
      setCookie("toDelete", "val", 7);
      expect(getCookie("toDelete")).toBe("val");
      deleteCookie("toDelete");
      expect(getCookie("toDelete")).toBeUndefined();
    });
  });
});
