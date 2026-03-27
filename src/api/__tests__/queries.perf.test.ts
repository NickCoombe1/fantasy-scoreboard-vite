import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Performance tests for API call patterns.
 * Uses mock fetch with simulated latency to measure sequential vs parallel impact.
 */

const SIMULATED_LATENCY_MS = 50; // Per-request latency
const NUM_TEAMS = 8; // Typical league size

function mockFetchWithDelay(latencyMs: number) {
  return vi.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve({ totalPoints: 10, picks: [], playersPlayed: 5 }),
            }),
          latencyMs,
        ),
      ),
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useAllLeagueScoringData fetch pattern", () => {
  const entries = Array.from({ length: NUM_TEAMS }, (_, i) => ({
    id: i + 1,
    entryId: 100 + i,
  }));

  it(`sequential: ${NUM_TEAMS} teams × ${SIMULATED_LATENCY_MS}ms each`, async () => {
    const mockFetch = mockFetchWithDelay(SIMULATED_LATENCY_MS);
    vi.stubGlobal("fetch", mockFetch);

    const start = performance.now();

    // Current pattern: sequential for...of await
    const results: Record<number, unknown> = {};
    for (const entry of entries) {
      if (!entry.entryId) continue;
      const response = await fetch(`/api/fetchScoringData?teamID=${entry.entryId}&gameweek=1`);
      const data = await (response as Response).json();
      results[entry.id] = data;
    }

    const elapsed = performance.now() - start;

    expect(Object.keys(results)).toHaveLength(NUM_TEAMS);
    expect(mockFetch).toHaveBeenCalledTimes(NUM_TEAMS);

    // Sequential should take roughly NUM_TEAMS * LATENCY
    const expectedMinMs = NUM_TEAMS * SIMULATED_LATENCY_MS * 0.8;
    expect(elapsed).toBeGreaterThanOrEqual(expectedMinMs);

    console.log(`  Sequential (${NUM_TEAMS} teams): ${elapsed.toFixed(0)}ms`);
  });

  it(`parallel: ${NUM_TEAMS} teams × ${SIMULATED_LATENCY_MS}ms each`, async () => {
    const mockFetch = mockFetchWithDelay(SIMULATED_LATENCY_MS);
    vi.stubGlobal("fetch", mockFetch);

    const start = performance.now();

    // Target pattern: Promise.allSettled
    const settled = await Promise.allSettled(
      entries
        .filter((e) => e.entryId)
        .map(async (entry) => {
          const response = await fetch(`/api/fetchScoringData?teamID=${entry.entryId}&gameweek=1`);
          const data = await (response as Response).json();
          return { id: entry.id, data };
        }),
    );

    const results: Record<number, unknown> = {};
    for (const result of settled) {
      if (result.status === "fulfilled") {
        results[result.value.id] = result.value.data;
      }
    }

    const elapsed = performance.now() - start;

    expect(Object.keys(results)).toHaveLength(NUM_TEAMS);
    expect(mockFetch).toHaveBeenCalledTimes(NUM_TEAMS);

    // Parallel should take roughly 1 × LATENCY (all fire at once)
    const maxExpectedMs = SIMULATED_LATENCY_MS * 3; // generous buffer
    expect(elapsed).toBeLessThan(maxExpectedMs);

    console.log(`  Parallel   (${NUM_TEAMS} teams): ${elapsed.toFixed(0)}ms`);
  });
});
