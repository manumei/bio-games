import { hashString } from "@/lib/rng";

const MS_PER_DAY = 86_400_000;
const DEFAULT_EPOCH_KEY = "2026-01-01";

function parseDayKeyUTC(dayKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!match) {
    throw new RangeError(`Invalid dayKey "${dayKey}" (expected YYYY-MM-DD)`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day);
}

/**
 * Format a Date as "YYYY-MM-DD" in the player's local timezone.
 */
export function getDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Whole days between epochKey (default "2026-01-01") and dayKey, DST-safe.
 */
export function dayNumber(
  dayKey: string,
  epochKey: string = DEFAULT_EPOCH_KEY
): number {
  const dayUtc = parseDayKeyUTC(dayKey);
  const epochUtc = parseDayKeyUTC(epochKey);
  return Math.round((dayUtc - epochUtc) / MS_PER_DAY);
}

/**
 * Milliseconds remaining until the next local midnight (00:00:00.000).
 */
export function msUntilNextDay(now: Date = new Date()): number {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

/**
 * Deterministic 32-bit daily seed for a given game slug and local dayKey.
 */
export function dailySeed(gameSlug: string, dayKey: string): number {
  return hashString(`${gameSlug}:${dayKey}`);
}
