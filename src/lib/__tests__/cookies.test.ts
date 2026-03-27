import { describe, it, expect, beforeEach } from "vitest";
import { getCookie, setCookie, deleteCookie } from "../cookies";

describe("cookies", () => {
  beforeEach(() => {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name) document.cookie = `${name}=; max-age=0; path=/`;
    });
  });

  describe("getCookie", () => {
    it("returns the value of an existing cookie", () => {
      document.cookie = "testKey=testValue; path=/";
      expect(getCookie("testKey")).toBe("testValue");
    });

    it("returns undefined when cookie does not exist", () => {
      expect(getCookie("nonexistent")).toBeUndefined();
    });

    it("returns correct value when multiple cookies exist", () => {
      document.cookie = "a=1; path=/";
      document.cookie = "b=2; path=/";
      expect(getCookie("a")).toBe("1");
      expect(getCookie("b")).toBe("2");
    });
  });

  describe("setCookie", () => {
    it("sets a cookie with the given name and value", () => {
      setCookie("myKey", "myValue", 7);
      expect(getCookie("myKey")).toBe("myValue");
    });
  });

  describe("deleteCookie", () => {
    it("removes a cookie", () => {
      setCookie("toDelete", "val", 7);
      expect(getCookie("toDelete")).toBe("val");
      deleteCookie("toDelete");
      expect(getCookie("toDelete")).toBeUndefined();
    });
  });
});
