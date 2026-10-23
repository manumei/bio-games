import { readJSON, storageKey, writeJSON } from "@/lib/storage";

export interface GameStats {
  version: 1;
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  histogram: Record<string, number>;
  lastRecordedDayKey: string | null;
}

const STATS_STORAGE_SUFFIX = "stats";

export function emptyStats(): GameStats {
  return {
    version: 1,
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    histogram: {},
    lastRecordedDayKey: null,
  };
}

function isGameStats(value: unknown): value is GameStats {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.version === 1 &&
    typeof candidate.played === "number" &&
    typeof candidate.wins === "number" &&
    typeof candidate.currentStreak === "number" &&
    typeof candidate.maxStreak === "number" &&
    typeof candidate.histogram === "object" &&
    candidate.histogram !== null &&
    (typeof candidate.lastRecordedDayKey === "string" ||
      candidate.lastRecordedDayKey === null)
  );
}

/**
 * Apply a completed game result to stats.
 * Streak rule: win -> currentStreak + 1; loss -> 0; days without playing -> unchanged.
 * Idempotent per dayKey: if result.dayKey === stats.lastRecordedDayKey, returns stats unchanged.
 */
export function applyResult(
  stats: GameStats,
  result: { dayKey: string; won: boolean; bucket: string }
): GameStats {
  if (stats.lastRecordedDayKey === result.dayKey) {
    return stats;
  }

  const played = stats.played + 1;
  const wins = stats.wins + (result.won ? 1 : 0);
  const currentStreak = result.won ? stats.currentStreak + 1 : 0;
  const maxStreak = Math.max(stats.maxStreak, currentStreak);
  const histogram = {
    ...stats.histogram,
    [result.bucket]: (stats.histogram[result.bucket] ?? 0) + 1,
  };

  return {
    version: 1,
    played,
    wins,
    currentStreak,
    maxStreak,
    histogram,
    lastRecordedDayKey: result.dayKey,
  };
}

export function loadStats(gameSlug: string): GameStats {
  return readJSON(
    storageKey(gameSlug, STATS_STORAGE_SUFFIX),
    emptyStats(),
    isGameStats
  );
}

export function saveStats(gameSlug: string, stats: GameStats): void {
  writeJSON(storageKey(gameSlug, STATS_STORAGE_SUFFIX), stats);
}
