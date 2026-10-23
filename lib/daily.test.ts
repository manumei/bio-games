import { describe, expect, it } from "vitest";
import {
  dailySeed,
  dayNumber,
  getDayKey,
  msUntilNextDay,
} from "@/lib/daily";

describe("lib/daily", () => {
  it("formats local Date objects as YYYY-MM-DD", () => {
    const date = new Date(2026, 9, 5, 14, 30, 0); // Oct 5, 2026 local
    expect(getDayKey(date)).toBe("2026-10-05");
  });

  it("computes whole day numbers across DST changes and year boundaries", () => {
    expect(dayNumber("2026-01-01", "2026-01-01")).toBe(0);
    expect(dayNumber("2026-01-02", "2026-01-01")).toBe(1);
    // Across Northern Hemisphere spring-forward (March) and fall-back (Oct/Nov) DST transitions
    expect(dayNumber("2026-04-01", "2026-03-01")).toBe(31);
    expect(dayNumber("2026-11-10", "2026-10-20")).toBe(21);
    // Across year boundary (2026 is non-leap: 365 days)
    expect(dayNumber("2027-01-01", "2026-01-01")).toBe(365);
  });

  it("throws on malformed dayKey", () => {
    expect(() => dayNumber("2026/01/01")).toThrow(RangeError);
  });

  it("msUntilNextDay returns a value strictly within (0, 25h] for any local timestamp", () => {
    const midday = new Date(2026, 9, 23, 12, 0, 0, 0);
    const ms = msUntilNextDay(midday);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(25 * 3_600_000);
    expect(ms).toBe(12 * 3_600_000);
  });

  it("dailySeed is deterministic and game-specific", () => {
    expect(dailySeed("taxo-bingo", "2026-10-23")).toBe(
      dailySeed("taxo-bingo", "2026-10-23")
    );
    expect(dailySeed("taxo-bingo", "2026-10-23")).not.toBe(
      dailySeed("bio-wordle", "2026-10-23")
    );
  });
});
