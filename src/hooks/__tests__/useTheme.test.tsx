import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme";

// Verifies the actual localStorage <-> DOM round-trip, since the hook talks
// to window.document.documentElement directly rather than through a mockable
// abstraction — a pure "does the code look right" read isn't enough here.
describe("useTheme caching", () => {
  const root = () => window.document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root().className = "light hidden";
  });

  afterEach(() => {
    root().className = "";
  });

  it("restores the saved theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
    expect(root().classList.contains("light")).toBe(false);
  });

  it("defaults to light when nothing is saved yet", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    expect(root().classList.contains("light")).toBe(true);
  });

  it("removes the 'hidden' class once the saved theme has been applied", () => {
    localStorage.setItem("theme", "dark");
    renderHook(() => useTheme());

    expect(root().classList.contains("hidden")).toBe(false);
  });

  it("persists a selected theme to localStorage and updates the DOM class", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.selectTheme("dark");
    });

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(root().classList.contains("dark")).toBe(true);
    expect(root().classList.contains("light")).toBe(false);
    expect(result.current.theme).toBe("dark");
  });

  it("survives a fresh mount after a theme change (simulates reopening the app)", () => {
    const first = renderHook(() => useTheme());
    act(() => {
      first.result.current.selectTheme("dark");
    });
    first.unmount();

    // Fresh mount, e.g. a new page load / reopening the PWA
    const second = renderHook(() => useTheme());
    expect(second.result.current.theme).toBe("dark");
  });

  it("is a no-op when selecting the theme that's already active", () => {
    const { result } = renderHook(() => useTheme());
    const setItemCallsBefore = localStorage.getItem("theme");

    act(() => {
      result.current.selectTheme("light"); // already light
    });

    expect(localStorage.getItem("theme")).toBe(setItemCallsBefore); // unchanged (still null)
  });
});
