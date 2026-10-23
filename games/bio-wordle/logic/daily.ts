import { getAnswer } from "@/games/bio-wordle/data/answers";
import { answerFor } from "@/games/bio-wordle/logic/schedule";
import type { WordleOptions } from "@/games/bio-wordle/types";
import type { DailyStateBase } from "@/lib/daily";
import { applyResult, loadStats, saveStats, type GameStats } from "@/lib/stats";
import { readJSON, storageKey, writeJSON } from "@/lib/storage";

export const WORDLE_SLUG = "bio-wordle";
const DAILY_STORAGE_SUFFIX = "daily";

export interface WordleDailyState extends DailyStateBase<WordleOptions> {
  answer: string;
  guesses: string[];
  hintUsed: boolean;
}

export interface RestoreWordleDailyResult {
  state: WordleDailyState | null;
  mustRecord: boolean;
  abandonedState: WordleDailyState | null;
}

export function isValidWordleDailyState(
  value: unknown
): value is WordleDailyState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  if (candidate.version !== 1) return false;
  if (
    typeof candidate.dayKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(candidate.dayKey)
  ) {
    return false;
  }

  const options = candidate.options as Record<string, unknown> | undefined;
  if (
    typeof options !== "object" ||
    options === null ||
    typeof options.hardMode !== "boolean"
  ) {
    return false;
  }

  if (
    candidate.status !== "playing" &&
    candidate.status !== "won" &&
    candidate.status !== "lost"
  ) {
    return false;
  }

  if (typeof candidate.startedAt !== "number") return false;
  if (candidate.deadline !== null && typeof candidate.deadline !== "number") {
    return false;
  }
  if (candidate.endedAt !== null && typeof candidate.endedAt !== "number") {
    return false;
  }

  if (
    typeof candidate.answer !== "string" ||
    !/^[a-z]{4,7}$/.test(candidate.answer) ||
    !getAnswer(candidate.answer)
  ) {
    return false;
  }

  if (!Array.isArray(candidate.guesses)) return false;
  for (const g of candidate.guesses) {
    if (typeof g !== "string" || g.length !== candidate.answer.length) {
      return false;
    }
  }

  if (typeof candidate.hintUsed !== "boolean") return false;

  return true;
}

export function createDailyState(
  dayKey: string,
  options: WordleOptions,
  now: number
): WordleDailyState {
  const ans = answerFor(dayKey);
  return {
    version: 1,
    dayKey,
    options: { hardMode: options.hardMode },
    status: "playing",
    startedAt: now,
    deadline: null,
    endedAt: null,
    endReason: null,
    answer: ans.word,
    guesses: [],
    hintUsed: false,
  };
}

export function restoreDailyState(
  saved: unknown,
  todayKey: string,
  now: number
): RestoreWordleDailyResult {
  if (!isValidWordleDailyState(saved)) {
    return { state: null, mustRecord: false, abandonedState: null };
  }

  if (saved.dayKey === todayKey) {
    return { state: saved, mustRecord: false, abandonedState: null };
  }

  if (saved.status === "playing") {
    const abandoned: WordleDailyState = {
      ...saved,
      status: "lost",
      endedAt: now,
      endReason: "abandoned",
    };
    return { state: null, mustRecord: true, abandonedState: abandoned };
  }

  return { state: null, mustRecord: false, abandonedState: null };
}

export function loadSavedWordleDaily(): unknown {
  return readJSON<unknown>(storageKey(WORDLE_SLUG, DAILY_STORAGE_SUFFIX), null);
}

export function saveWordleDaily(state: WordleDailyState): void {
  writeJSON(storageKey(WORDLE_SLUG, DAILY_STORAGE_SUFFIX), state);
}

export function recordWordleDailyStats(state: WordleDailyState): GameStats {
  const current = loadStats(WORDLE_SLUG);
  const won = state.status === "won";
  const bucket = won ? String(state.guesses.length) : "X";
  const updated = applyResult(current, {
    dayKey: state.dayKey,
    won,
    bucket,
  });
  saveStats(WORDLE_SLUG, updated);
  return updated;
}

