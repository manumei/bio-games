import { describe, expect, it } from "vitest";
import type { TaxoDailyState } from "@/games/taxo-bingo/logic/daily";
import { buildShareText } from "@/games/taxo-bingo/logic/share";

describe("games/taxo-bingo/logic/share", () => {
  const sampleGrid = [
    "bacteria",
    "animalia",
    "angiospermae",
    "mammalia",
    "aves",
    "reptilia",
    "amphibia",
    "insecta",
    "arachnida",
    "crustacea",
    "mollusca",
    "annelida",
  ];

  it("matches the worked example in Step 14 verbatim", () => {
    const placements: Record<string, string> = {};
    // Fill all except index 2 (row 0 col 2) and index 9 (row 2 col 1)
    sampleGrid.forEach((id, idx) => {
      if (idx !== 2 && idx !== 9) {
        placements[id] = "homo_sapiens";
      }
    });

    const state: TaxoDailyState = {
      version: 1,
      dayKey: "2026-02-11",
      options: { timer: 120, hardMode: true },
      status: "lost",
      startedAt: 1_000_000,
      deadline: 1_120_000,
      endedAt: 1_083_000, // 37s left
      endReason: "gave-up",
      gridIds: sampleGrid,
      placements,
      mistakes: 2,
      skips: 3,
    };

    const text = buildShareText(state, {
      dayNumber: 42,
      url: "https://bio-games.vercel.app/taxo-bingo",
    });

    expect(text).toBe(
      [
        "Taxo Bingo #42 🧬 10/12 💀 Hard",
        "⏱️ 37s left · ❌ 2 wrong clicks",
        "🟩🟩⬛🟩",
        "🟩🟩🟩🟩",
        "🟩⬛🟩🟩",
        "https://bio-games.vercel.app/taxo-bingo",
      ].join("\n")
    );
  });

  it("shows time's up and gave up when relevant and omits timer when no timer was used", () => {
    const baseState: TaxoDailyState = {
      version: 1,
      dayKey: "2026-02-11",
      options: { timer: 180, hardMode: false },
      status: "lost",
      startedAt: 1_000_000,
      deadline: 1_180_000,
      endedAt: 1_180_000,
      endReason: "timeout",
      gridIds: sampleGrid,
      placements: {},
      mistakes: 1,
      skips: 0,
    };

    const timeoutText = buildShareText(baseState, { dayNumber: 10 });
    expect(timeoutText).toContain("time's up ⏰ · ❌ 1 wrong click");

    const gaveUpNoTimer: TaxoDailyState = {
      ...baseState,
      options: { timer: null, hardMode: false },
      deadline: null,
      endReason: "gave-up",
      mistakes: 0,
    };
    const gaveUpText = buildShareText(gaveUpNoTimer, { dayNumber: 10 });
    expect(gaveUpText).toContain("gave up 🏳️ · ❌ 0 wrong clicks");

    const wonNoTimerZeroMistakes: TaxoDailyState = {
      ...baseState,
      options: { timer: null, hardMode: false },
      status: "won",
      deadline: null,
      endReason: "completed",
      mistakes: 0,
    };
    const noTimerText = buildShareText(wonNoTimerZeroMistakes, {
      dayNumber: 10,
    });
    expect(noTimerText).not.toContain("⏱️");
  });
});

