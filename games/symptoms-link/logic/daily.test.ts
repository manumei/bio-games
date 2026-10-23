import { describe, expect, it } from "vitest";
import {
  createDailyState,
  restoreDailyState,
  type LinkDailyState,
} from "@/games/symptoms-link/logic/daily";

describe("games/symptoms-link/logic/daily", () => {
  const day1 = "2026-04-17";
  const day2 = "2026-04-18";
  const now = 1_700_000_000_000;

  it("resumes same-day playing state at the right stage and finalizes abandoned previous-day game", () => {
    const created = createDailyState(day1, { hardMode: false }, now);
    const mid: LinkDailyState = {
      ...created,
      stage: 3,
      log: [{ kind: "wrong", diseaseId: "malaria" }, { kind: "skip" }],
    };

    const sameDay = restoreDailyState(mid, day1, now + 5000);
    expect(sameDay.state?.stage).toBe(3);
    expect(sameDay.mustRecord).toBe(false);

    const nextDayAbandoned = restoreDailyState(mid, day2, now + 90_000_000);
    expect(nextDayAbandoned.state).toBeNull();
    expect(nextDayAbandoned.mustRecord).toBe(true);
    expect(nextDayAbandoned.abandonedState?.status).toBe("lost");
    expect(nextDayAbandoned.abandonedState?.endReason).toBe("abandoned");
  });
});
