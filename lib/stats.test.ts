import { describe, expect, it } from "vitest";
import { applyResult, emptyStats } from "@/lib/stats";

describe("lib/stats", () => {
  it("increments streak on win, resets on loss, and preserves streak across skipped days", () => {
    let stats = emptyStats();

    stats = applyResult(stats, { dayKey: "2026-10-01", won: true, bucket: "12" });
    expect(stats.played).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
    expect(stats.histogram).toEqual({ "12": 1 });

    // Skip 2026-10-02, win on 2026-10-03 -> streak continues
    stats = applyResult(stats, { dayKey: "2026-10-03", won: true, bucket: "12" });
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.histogram).toEqual({ "12": 2 });

    // Loss on 2026-10-04 -> currentStreak resets to 0, maxStreak stays 2
    stats = applyResult(stats, { dayKey: "2026-10-04", won: false, bucket: "8" });
    expect(stats.played).toBe(3);
    expect(stats.wins).toBe(2);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
    expect(stats.histogram).toEqual({ "12": 2, "8": 1 });
  });

  it("is idempotent when recording the same dayKey twice", () => {
    const initial = applyResult(emptyStats(), {
      dayKey: "2026-10-23",
      won: true,
      bucket: "12",
    });
    const duplicate = applyResult(initial, {
      dayKey: "2026-10-23",
      won: false,
      bucket: "0",
    });

    expect(duplicate).toBe(initial);
    expect(duplicate.played).toBe(1);
    expect(duplicate.currentStreak).toBe(1);
  });
});
