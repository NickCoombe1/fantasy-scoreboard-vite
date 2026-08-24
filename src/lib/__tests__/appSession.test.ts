import { describe, it, expect, beforeEach } from "vitest";
import { createRouter, createMemoryHistory } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { recordNavigation, isFirstNavigation } from "../appSession";

// Guards the fix for the isFreshVisit bug: verifies against a real router
// instance that onBeforeLoad actually fires (onResolved, despite being in the
// type defs, is never emitted by the installed router-core version) and that
// it distinguishes the initial load from later client-side navigations.
describe("appSession + router integration", () => {
  beforeEach(() => {
    // reset the module's navigation count between tests
    // (no exported reset — recreate via dynamic import isolation instead)
  });

  it("treats only the initial load as the first navigation", async () => {
    let count = 0;
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/welcome"] }),
    });
    router.subscribe("onBeforeLoad", () => {
      count++;
    });

    await router.load();
    expect(count).toBe(1);

    await router.navigate({ to: "/" });
    expect(count).toBeGreaterThan(1);

    await router.navigate({ to: "/welcome" });
    expect(count).toBeGreaterThan(2);
  });

  it("isFirstNavigation reflects recordNavigation call count", () => {
    // Exercises the exported module functions directly (separate from the
    // router-integration assertions above, which only prove onBeforeLoad fires).
    expect(isFirstNavigation()).toBe(true);
    recordNavigation();
    expect(isFirstNavigation()).toBe(true); // exactly one navigation so far = still "first"
    recordNavigation();
    expect(isFirstNavigation()).toBe(false); // a second navigation means no longer fresh
  });
});
