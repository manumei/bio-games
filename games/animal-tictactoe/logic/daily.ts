import { dailySeed, type DailyStateBase } from "@/lib/daily";
import { createRng } from "@/lib/rng";
import { applyResult, loadStats, saveStats, type GameStats } from "@/lib/stats";
import { readJSON, storageKey, writeJSON } from "@/lib/storage";
import { GRID_CELL_COUNT } from "../config";
import { ANIMALS } from "../data/animals";
import { TRAITS } from "../data/traits";
import { generateGrid } from "./grid";

export const TICTAC_SLUG = "animal-tictactoe";
const DAILY_STORAGE_SUFFIX = "daily";

const VALID_TRAIT_IDS = new Set<string>(TRAITS.map((t) => t.id));
const VALID_ANIMAL_IDS = new Set<string>(ANIMALS.map((a) => a.id));

export interface TicTacDailyState
  extends DailyStateBase<{ hardMode: boolean }> {
  rows: [string, string, string];
  cols: [string, string, string];
  cells: (string | null)[];
  guessesUsed: number;
  used: string[];
}

export interface RestoreTicTacDailyResult {
  state: TicTacDailyState | null;
  mustRecord: boolean;
  abandonedState: TicTacDailyState | null;
}

export function isValidTicTacDailyState(
  value: unknown,
): value is TicTacDailyState {
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

  if (
    !Array.isArray(c.rows) ||
    c.rows.length !== 3 ||
    !c.rows.every((id) => typeof id === "string" && VALID_TRAIT_IDS.has(id))
  ) {
    return false;
  }

  if (
    !Array.isArray(c.cols) ||
    c.cols.length !== 3 ||
    !c.cols.every((id) => typeof id === "string" && VALID_TRAIT_IDS.has(id))
  ) {
    return false;
  }

  if (
    !Array.isArray(c.cells) ||
    c.cells.length !== GRID_CELL_COUNT ||
    !c.cells.every(
      (id) => id === null || (typeof id === "string" && VALID_ANIMAL_IDS.has(id)),
    )
  ) {
    return false;
  }

  if (typeof c.guessesUsed !== "number" || c.guessesUsed < 0) {
    return false;
  }

  if (
    !Array.isArray(c.used) ||
    !c.used.every((id) => typeof id === "string" && VALID_ANIMAL_IDS.has(id))
  ) {
    return false;
  }

  return true;
}

export function createDailyState(
  dayKey: string,
  options: { hardMode: boolean },
  now: number,
): TicTacDailyState {
  const seed = dailySeed(TICTAC_SLUG, dayKey);
  const grid = generateGrid(createRng(seed), ANIMALS, TRAITS);
  return {
    version: 1,
    dayKey,
    options: { hardMode: options.hardMode },
    status: "playing",
    startedAt: now,
    deadline: null,
    endedAt: null,
    endReason: null,
    rows: grid.rows,
    cols: grid.cols,
    cells: Array<string | null>(GRID_CELL_COUNT).fill(null),
    guessesUsed: 0,
    used: [],
  };
}

export function restoreDailyState(
  saved: unknown,
  todayKey: string,
  now: number,
): RestoreTicTacDailyResult {
  if (!isValidTicTacDailyState(saved)) {
    return { state: null, mustRecord: false, abandonedState: null };
  }

  if (saved.dayKey === todayKey) {
    return { state: saved, mustRecord: false, abandonedState: null };
  }

  if (saved.status === "playing") {
    const abandoned: TicTacDailyState = {
      ...saved,
      status: "lost",
      endedAt: now,
      endReason: "abandoned",
    };
    return { state: null, mustRecord: true, abandonedState: abandoned };
  }

  return { state: null, mustRecord: false, abandonedState: null };
}

export function loadSavedTicTacDaily(): unknown {
  return readJSON<unknown>(
    storageKey(TICTAC_SLUG, DAILY_STORAGE_SUFFIX),
    null,
  );
}

export function saveTicTacDaily(state: TicTacDailyState): void {
  writeJSON(storageKey(TICTAC_SLUG, DAILY_STORAGE_SUFFIX), state);
}

export function recordTicTacDailyStats(state: TicTacDailyState): GameStats {
  const current = loadStats(TICTAC_SLUG);
  const filledCount = state.cells.filter((c) => c !== null).length;
  const won = state.status === "won" || filledCount === GRID_CELL_COUNT;
  const bucket = String(filledCount);
  const updated = applyResult(current, {
    dayKey: state.dayKey,
    won,
    bucket,
  });
  saveStats(TICTAC_SLUG, updated);
  return updated;
}

