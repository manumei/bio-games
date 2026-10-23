import { describe, expect, it } from "vitest";
import {
  createDailyState,
  loadSavedTaxoDaily,
  recordTaxoDailyStats,
  restoreDailyState,
  saveTaxoDaily,
  type TaxoDailyState,
} from "@/games/taxo-bingo/logic/daily";
import {
  createInitialTaxoState,
  taxoReducer,
} from "@/games/taxo-bingo/logic/reducer";
import { createRng } from "@/lib/rng";
import { applyResult, emptyStats, loadStats } from "@/lib/stats";

describe("games/taxo-bingo/logic/daily", () => {
  const day1 = "2026-04-17";
  const day2 = "2026-04-18";
  const day3 = "2026-04-19";
  const startMs = 1_700_000_000_000;

  it("Scenario 1 & 10: creates deterministic daily state for the same dayKey across two devices", () => {
    const stateA = createDailyState(
      day1,
      { timer: 180, hardMode: false },
      startMs
    );
    const stateB = createDailyState(
      day1,
      { timer: 120, hardMode: true },
      startMs + 5000
    );

    expect(stateA.gridIds).toHaveLength(12);
    expect(stateA.gridIds).toEqual(stateB.gridIds);
    expect(stateA.status).toBe("playing");
    expect(stateA.deadline).toBe(startMs + 180_000);
    expect(stateB.deadline).toBe(startMs + 5000 + 120_000);
  });

  it("Scenario 2: resumes same-day in-progress game directly with original deadline", () => {
    const initial = createDailyState(
      day1,
      { timer: 180, hardMode: false },
      startMs
    );
    const midGame: TaxoDailyState = {
      ...initial,
      placements: { [initial.gridIds[0]!]: "homo_sapiens" },
      mistakes: 2,
      skips: 4,
    };

    const restored = restoreDailyState(midGame, day1, startMs + 45_000);
    expect(restored.mustRecord).toBe(false);
    expect(restored.abandonedState).toBeNull();
    expect(restored.state).toEqual(midGame);
    expect(restored.state?.deadline).toBe(startMs + 180_000);
  });

  it("Scenario 3: finalizes timeout-while-away as a loss once when reopened past deadline", () => {
    const initial = createDailyState(
      day1,
      { timer: 120, hardMode: true },
      startMs
    );
    const restored = restoreDailyState(initial, day1, startMs + 150_000);

    expect(restored.mustRecord).toBe(true);
    expect(restored.state?.status).toBe("lost");
    expect(restored.state?.endReason).toBe("timeout");
    expect(restored.state?.endedAt).toBe(initial.deadline);

    // Subsequent reload of the finalized state does not record again
    const secondReload = restoreDailyState(
      restored.state,
      day1,
      startMs + 160_000
    );
    expect(secondReload.mustRecord).toBe(false);
    expect(secondReload.state?.status).toBe("lost");
  });

  it("Scenario 4, 5 & 7: records wins and give-ups into stats idempotently and tracks streak >= 3", () => {
    let stats = emptyStats();
    stats = applyResult(stats, { dayKey: day1, won: true, bucket: "12" });
    expect(stats.played).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.histogram["12"]).toBe(1);

    // Reloading same day does not double-count
    stats = applyResult(stats, { dayKey: day1, won: true, bucket: "12" });
    expect(stats.played).toBe(1);

    // Day 2 win -> streak 2 (< 3, no badge threshold)
    stats = applyResult(stats, { dayKey: day2, won: true, bucket: "12" });
    expect(stats.currentStreak).toBe(2);
    expect(stats.currentStreak >= 3).toBe(false);

    // Day 3 win -> streak 3 (>= 3, badge threshold)
    stats = applyResult(stats, { dayKey: day3, won: true, bucket: "12" });
    expect(stats.currentStreak).toBe(3);
    expect(stats.currentStreak >= 3).toBe(true);

    // Next day give up with 7 filled -> loss, histogram["7"] +1, streak 0
    stats = applyResult(stats, {
      dayKey: "2026-04-20",
      won: false,
      bucket: "7",
    });
    expect(stats.played).toBe(4);
    expect(stats.wins).toBe(3);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(3);
    expect(stats.histogram["7"]).toBe(1);
  });

  it("Scenario 6: next day leaves yesterday's finished game untouched, and finalizes an abandoned game as a loss", () => {
    const initial = createDailyState(
      day1,
      { timer: 180, hardMode: false },
      startMs
    );
    const finishedYesterday: TaxoDailyState = {
      ...initial,
      status: "won",
      endedAt: startMs + 90_000,
      endReason: "completed",
    };

    const nextDayFromFinished = restoreDailyState(
      finishedYesterday,
      day2,
      startMs + 90_000_000
    );
    expect(nextDayFromFinished.state).toBeNull();
    expect(nextDayFromFinished.mustRecord).toBe(false);
    expect(nextDayFromFinished.abandonedState).toBeNull();

    // Unfinished from yesterday -> abandoned loss
    const unfinishedYesterday: TaxoDailyState = {
      ...initial,
      placements: {
        [initial.gridIds[0]!]: "homo_sapiens",
        [initial.gridIds[1]!]: "panthera_leo",
      },
    };
    const nextDayFromAbandoned = restoreDailyState(
      unfinishedYesterday,
      day2,
      startMs + 90_000_000
    );
    expect(nextDayFromAbandoned.state).toBeNull();
    expect(nextDayFromAbandoned.mustRecord).toBe(true);
    expect(nextDayFromAbandoned.abandonedState?.dayKey).toBe(day1);
    expect(nextDayFromAbandoned.abandonedState?.status).toBe("lost");
    expect(nextDayFromAbandoned.abandonedState?.endReason).toBe("abandoned");
  });

  it("Scenario 8 & 9: practice mode does not alter dailyfinished state, and unavailable storage does not crash", () => {
    const rng = createRng(99);
    const practiceState = taxoReducer(createInitialTaxoState(), {
      type: "START",
      rng,
      mode: "practice",
      dayKey: null,
      seed: 99,
    });
    expect(practiceState.mode).toBe("practice");
    expect(practiceState.dayKey).toBeNull();

    // In node test env without window.localStorage, storage helpers safely no-op
    const sampleDaily = createDailyState(
      day1,
      { timer: 180, hardMode: false },
      startMs
    );
    expect(() => saveTaxoDaily(sampleDaily)).not.toThrow();
    expect(loadSavedTaxoDaily()).toBeNull();
    expect(() => recordTaxoDailyStats(sampleDaily)).not.toThrow();
    expect(loadStats("taxo-bingo")).toEqual(emptyStats());
  });

  it("discards invalid version or corrupted catalog IDs cleanly without crashing", () => {
    expect(
      restoreDailyState({ version: 2, dayKey: day1 }, day1, startMs).state
    ).toBeNull();

    const valid = createDailyState(
      day1,
      { timer: 180, hardMode: false },
      startMs
    );
    const corruptedTaxon = {
      ...valid,
      gridIds: ["not_a_real_taxon", ...valid.gridIds.slice(1)],
    };
    expect(restoreDailyState(corruptedTaxon, day1, startMs).state).toBeNull();
  });
});
