import { dailySeed, type DailyStateBase } from "@/lib/daily";
import { createRng } from "@/lib/rng";
import { applyResult, loadStats, saveStats, type GameStats } from "@/lib/stats";
import { readJSON, storageKey, writeJSON } from "@/lib/storage";
import { PASS_SCORE, ROUND_SIZE } from "../config";
import { PARTS, type CellType } from "../data/parts";
import { generateRound, type CellQuestion } from "./questions";
import type { CellAnswerRecord } from "./reducer";

export const CELL_SLUG = "cell-classifier";
const DAILY_STORAGE_SUFFIX = "daily";

const VALID_PART_IDS = new Set<string>(PARTS.map((p) => p.id));
const VALID_CELL_TYPES = new Set<CellType>(["animal", "plant", "bacteria"]);

export interface CellDailyState
  extends DailyStateBase<{ hardMode: boolean }> {
  questions: CellQuestion[];
  answers: CellAnswerRecord[];
}

export interface RestoreCellDailyResult {
  state: CellDailyState | null;
  mustRecord: boolean;
  abandonedState: CellDailyState | null;
}

export function cellDailySeed(dayKey: string, hardMode: boolean): number {
  return dailySeed(hardMode ? `${CELL_SLUG}:hard` : CELL_SLUG, dayKey);
}

export function isValidCellDailyState(value: unknown): value is CellDailyState {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;

  if (c.version !== 1) return false;
  if (
    typeof c.dayKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(c.dayKey)
  ) {
    return false;
  }

  const options = c.options as Record<string, unknown> | undefined;
  if (
    typeof options !== "object" ||
    options === null ||
    typeof options.hardMode !== "boolean"
  ) {
    return false;
  }

  if (c.status !== "playing" && c.status !== "won" && c.status !== "lost") {
    return false;
  }

  if (typeof c.startedAt !== "number") return false;

  if (!Array.isArray(c.questions) || c.questions.length !== ROUND_SIZE) {
    return false;
  }
  for (const item of c.questions) {
    if (typeof item !== "object" || item === null) return false;
    const q = item as Record<string, unknown>;
    if (q.type !== "name" && q.type !== "find" && q.type !== "classify") {
      return false;
    }
    if (
      typeof q.cell !== "string" ||
      !VALID_CELL_TYPES.has(q.cell as CellType)
    ) {
      return false;
    }
    if (typeof q.partId !== "string" || !VALID_PART_IDS.has(q.partId)) {
      return false;
    }
  }

  if (!Array.isArray(c.answers) || c.answers.length > ROUND_SIZE) {
    return false;
  }
  for (const ans of c.answers) {
    if (typeof ans !== "object" || ans === null) return false;
    const a = ans as Record<string, unknown>;
    if (typeof a.correct !== "boolean") return false;
    if (a.given !== null && typeof a.given !== "string") return false;
  }

  return true;
}

export function createDailyState(
  dayKey: string,
  options: { hardMode: boolean },
  now: number,
): CellDailyState {
  const seed = cellDailySeed(dayKey, options.hardMode);
  const questions = generateRound(createRng(seed), options.hardMode);
  return {
    version: 1,
    dayKey,
    options: { hardMode: options.hardMode },
    status: "playing",
    startedAt: now,
    deadline: null,
    endedAt: null,
    endReason: null,
    questions,
    answers: [],
  };
}

export function restoreDailyState(
  saved: unknown,
  todayKey: string,
  now: number,
): RestoreCellDailyResult {
  if (!isValidCellDailyState(saved)) {
    return { state: null, mustRecord: false, abandonedState: null };
  }

  if (saved.dayKey === todayKey) {
    return { state: saved, mustRecord: false, abandonedState: null };
  }

  if (saved.status === "playing") {
    const paddedAnswers = [...saved.answers];
    while (paddedAnswers.length < saved.questions.length) {
      paddedAnswers.push({ correct: false, given: null });
    }
    const abandoned: CellDailyState = {
      ...saved,
      answers: paddedAnswers,
      status: "lost",
      endedAt: now,
      endReason: "abandoned",
    };
    return { state: null, mustRecord: true, abandonedState: abandoned };
  }

  return { state: null, mustRecord: false, abandonedState: null };
}

export function loadSavedCellDaily(): unknown {
  return readJSON<unknown>(storageKey(CELL_SLUG, DAILY_STORAGE_SUFFIX), null);
}

export function saveCellDaily(state: CellDailyState): void {
  writeJSON(storageKey(CELL_SLUG, DAILY_STORAGE_SUFFIX), state);
}

export function recordCellDailyStats(state: CellDailyState): GameStats {
  const current = loadStats(CELL_SLUG);
  const score = state.answers.filter((a) => a.correct).length;
  const won = state.status === "won" && score >= PASS_SCORE;
  const bucket = String(score);
  const updated = applyResult(current, {
    dayKey: state.dayKey,
    won,
    bucket,
  });
  saveStats(CELL_SLUG, updated);
  return updated;
}

