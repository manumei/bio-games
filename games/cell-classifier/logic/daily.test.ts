import { describe, expect, it } from "vitest";
import { applyResult, emptyStats, loadStats } from "@/lib/stats";
import {
  CELL_SLUG,
  createDailyState,
  loadSavedCellDaily,
  recordCellDailyStats,
  restoreDailyState,
  saveCellDaily,
} from "./daily";

describe("Cell Classifier daily state", () => {
  it("1. returns null when no saved daily state exists", () => {
    expect(restoreDailyState(null, "2026-04-20", 1000)).toEqual({
      state: null,
      mustRecord: false,
      abandonedState: null,
    });
  });

  it("2. restores today's in-progress game without recording stats", () => {
    const state = createDailyState("2026-04-20", { hardMode: false }, 1000);
    state.answers.push({ correct: true, given: "golgi" });
    const restored = restoreDailyState(state, "2026-04-20", 2000);
    expect(restored.state).toEqual(state);
    expect(restored.mustRecord).toBe(false);
  });

  it("3. restores today's completed game without re-recording stats", () => {
    const state = createDailyState("2026-04-20", { hardMode: true }, 1000);
    state.status = "won";
    state.endedAt = 1800;
    state.endReason = "completed";
    const restored = restoreDailyState(state, "2026-04-20", 2000);
    expect(restored.state).toEqual(state);
    expect(restored.mustRecord).toBe(false);
  });

  it("4. marks yesterday's in-progress game as abandoned and pads answers", () => {
    const state = createDailyState("2026-04-19", { hardMode: false }, 1000);
    state.answers.push({ correct: true, given: "golgi" });
    const restored = restoreDailyState(state, "2026-04-20", 9000);
    expect(restored.state).toBeNull();
    expect(restored.mustRecord).toBe(true);
    expect(restored.abandonedState?.status).toBe("lost");
    expect(restored.abandonedState?.endReason).toBe("abandoned");
    expect(restored.abandonedState?.answers).toHaveLength(10);
  });

  it("5. ignores yesterday's completed game without recording again", () => {
    const state = createDailyState("2026-04-19", { hardMode: false }, 1000);
    state.status = "won";
    const restored = restoreDailyState(state, "2026-04-20", 9000);
    expect(restored.state).toBeNull();
    expect(restored.mustRecord).toBe(false);
  });

  it("6. rejects corrupt or schema-mismatched JSON", () => {
    expect(
      restoreDailyState({ version: 2, dayKey: "2026-04-20" }, "2026-04-20", 1)
        .state,
    ).toBeNull();
  });

  it("7. records stats idempotently in buckets 0..10 with win >= 8", () => {
    let stats = emptyStats();
    stats = applyResult(stats, {
      dayKey: "2026-04-20",
      won: true,
      bucket: "9",
    });
    stats = applyResult(stats, {
      dayKey: "2026-04-20",
      won: true,
      bucket: "9",
    });
    expect(stats.played).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.histogram["9"]).toBe(1);

    const sampleDaily = createDailyState(
      "2026-04-20",
      { hardMode: false },
      1000,
    );
    expect(() => saveCellDaily(sampleDaily)).not.toThrow();
    expect(loadSavedCellDaily()).toBeNull();
    expect(() => recordCellDailyStats(sampleDaily)).not.toThrow();
    expect(loadStats(CELL_SLUG)).toEqual(emptyStats());
  });
});

