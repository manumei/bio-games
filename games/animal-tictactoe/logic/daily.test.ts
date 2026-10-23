import { describe, expect, it } from "vitest";
import { applyResult, emptyStats, loadStats } from "@/lib/stats";
import {
  TICTAC_SLUG,
  createDailyState,
  loadSavedTicTacDaily,
  recordTicTacDailyStats,
  restoreDailyState,
  saveTicTacDaily,
} from "./daily";

describe("Animal Tic-Tac-Toe daily state", () => {
  it("1. returns null when no saved daily state exists", () => {
    expect(restoreDailyState(null, "2026-04-20", 1000)).toEqual({
      state: null,
      mustRecord: false,
      abandonedState: null,
    });
  });

  it("2. restores today's in-progress game without recording stats", () => {
    const state = createDailyState("2026-04-20", { hardMode: false }, 1000);
    state.cells[0] = "lion";
    state.guessesUsed = 1;
    const restored = restoreDailyState(state, "2026-04-20", 2000);
    expect(restored.state).toEqual(state);
    expect(restored.mustRecord).toBe(false);
    expect(restored.abandonedState).toBeNull();
  });

  it("3. restores today's completed game without re-recording stats", () => {
    const state = createDailyState("2026-04-20", { hardMode: true }, 1000);
    state.status = "won";
    state.endedAt = 1500;
    state.endReason = "completed";
    const restored = restoreDailyState(state, "2026-04-20", 2000);
    expect(restored.state).toEqual(state);
    expect(restored.mustRecord).toBe(false);
  });

  it("4. marks yesterday's in-progress game as abandoned and flags mustRecord", () => {
    const state = createDailyState("2026-04-19", { hardMode: false }, 1000);
    state.cells[0] = "lion";
    state.cells[1] = "koala";
    const restored = restoreDailyState(state, "2026-04-20", 9000);
    expect(restored.state).toBeNull();
    expect(restored.mustRecord).toBe(true);
    expect(restored.abandonedState?.status).toBe("lost");
    expect(restored.abandonedState?.endReason).toBe("abandoned");

    if (restored.abandonedState) {
      const filled = restored.abandonedState.cells.filter(
        (c) => c !== null,
      ).length;
      const stats = applyResult(emptyStats(), {
        dayKey: restored.abandonedState.dayKey,
        won: false,
        bucket: String(filled),
      });
      expect(stats.played).toBe(1);
      expect(stats.wins).toBe(0);
      expect(stats.histogram["2"]).toBe(1);
    }
  });

  it("5. ignores yesterday's completed game without recording again", () => {
    const state = createDailyState("2026-04-19", { hardMode: false }, 1000);
    state.status = "won";
    const restored = restoreDailyState(state, "2026-04-20", 9000);
    expect(restored.state).toBeNull();
    expect(restored.mustRecord).toBe(false);
    expect(restored.abandonedState).toBeNull();
  });

  it("6. rejects corrupt or schema-mismatched JSON", () => {
    expect(
      restoreDailyState({ version: 99, dayKey: "2026-04-20" }, "2026-04-20", 1),
    ).toEqual({
      state: null,
      mustRecord: false,
      abandonedState: null,
    });
    expect(
      restoreDailyState(
        {
          version: 1,
          dayKey: "2026-04-20",
          options: { hardMode: false },
          status: "playing",
          startedAt: 100,
          rows: ["not_a_trait", "bird", "reptile"],
          cols: ["carnivorous", "herbivore", "africa"],
          cells: Array(9).fill(null),
          guessesUsed: 0,
          used: [],
        },
        "2026-04-20",
        200,
      ).state,
    ).toBeNull();
  });

  it("7. records stats idempotently once per dayKey in buckets 0..9 and safely no-ops without storage", () => {
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
    expect(() => saveTicTacDaily(sampleDaily)).not.toThrow();
    expect(loadSavedTicTacDaily()).toBeNull();
    expect(() => recordTicTacDailyStats(sampleDaily)).not.toThrow();
    expect(loadStats(TICTAC_SLUG)).toEqual(emptyStats());
  });
});
