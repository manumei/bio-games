import { hashString } from "@/lib/rng";

const MS_PER_DAY = 86_400_000;
const DEFAULT_EPOCH_KEY = "2026-01-01";

export type DailyEndReason =
  | "completed"
  | "timeout"
  | "gave-up"
  | "failed"
  | "abandoned";

export interface DailyStateBase<TOptions> {
  version: 1;
  dayKey: string;
  options: TOptions; // locked menu choices
  status: "playing" | "won" | "lost";
  startedAt: number; // epoch ms
  deadline: number | null; // epoch ms, null = no timer
  endedAt: number | null;
  endReason: DailyEndReason | null;
}

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
 * 1-based puzzle number shown to players ("Taxo Bingo #42").
 */
export function puzzleNumber(
  dayKey: string,
  epochKey: string = DEFAULT_EPOCH_KEY
): number {
  return dayNumber(dayKey, epochKey) + 1;
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
