import { describe, expect, it } from "vitest";
import {
  createDailyState,
  restoreDailyState,
  type WordleDailyState,
} from "@/games/bio-wordle/logic/daily";

describe("games/bio-wordle/logic/daily", () => {
  const day1 = "2026-04-17";
  const day2 = "2026-04-18";
  const now = 1_700_000_000_000;

  it("creates and restores same-day in-progress and finished states", () => {
    const created = createDailyState(day1, { hardMode: true }, now);
    expect(created.status).toBe("playing");
    expect(created.options.hardMode).toBe(true);

    const midGame: WordleDailyState = {
      ...created,
      guesses: [created.answer.replace(/./g, "a")],
    };
    const restored = restoreDailyState(midGame, day1, now + 10_000);
    expect(restored.state).toEqual(midGame);
    expect(restored.mustRecord).toBe(false);
  });

  it("finalizes abandoned previous-day game as a loss and leaves finished previous-day game untouched", () => {
    const created = createDailyState(day1, { hardMode: false }, now);
    const abandoned = restoreDailyState(created, day2, now + 90_000_000);
    expect(abandoned.state).toBeNull();
    expect(abandoned.mustRecord).toBe(true);
    expect(abandoned.abandonedState?.status).toBe("lost");
    expect(abandoned.abandonedState?.endReason).toBe("abandoned");

    const finished: WordleDailyState = {
      ...created,
      status: "won",
      guesses: [created.answer],
      endedAt: now + 5000,
      endReason: "completed",
    };
    const nextDay = restoreDailyState(finished, day2, now + 90_000_000);
    expect(nextDay.state).toBeNull();
    expect(nextDay.mustRecord).toBe(false);
    expect(nextDay.abandonedState).toBeNull();
  });
});

