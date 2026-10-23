import { ORGANISMS } from "@/data/organisms";
import { TAXONOMY, type TaxonId } from "@/data/taxonomy";
import {
  GRID_SIZE,
  TIMER_OPTIONS,
  resolveTimerForHardMode,
  type TimerOption,
} from "@/games/taxo-bingo/config";
import { generateGrid } from "@/games/taxo-bingo/logic/grid";
import type { TaxoGameOptions } from "@/games/taxo-bingo/types";
import { dailySeed, type DailyStateBase } from "@/lib/daily";
import { createRng } from "@/lib/rng";
import { applyResult, loadStats, saveStats, type GameStats } from "@/lib/stats";
import { readJSON, removeItem, storageKey, writeJSON } from "@/lib/storage";

export const TAXO_SLUG = "taxo-bingo";
const DAILY_STORAGE_SUFFIX = "daily";

const VALID_TAXON_IDS = new Set<string>(TAXONOMY.map((t) => t.id));
const VALID_ORGANISM_IDS = new Set<string>(ORGANISMS.map((o) => o.id));

export interface TaxoDailyState extends DailyStateBase<TaxoGameOptions> {
  gridIds: TaxonId[];
  placements: Record<TaxonId, string>;
  mistakes: number;
  skips: number;
}

export interface RestoreDailyResult {
  state: TaxoDailyState | null;
  mustRecord: boolean;
  abandonedState: TaxoDailyState | null;
}

function isTimerOption(val: unknown): val is TimerOption {
  return (TIMER_OPTIONS as readonly unknown[]).includes(val);
}

export function isValidTaxoDailyState(value: unknown): value is TaxoDailyState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  if (candidate.version !== 1) return false;
  if (typeof candidate.dayKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.dayKey)) {
    return false;
  }

  const options = candidate.options as Record<string, unknown> | undefined;
  if (
    typeof options !== "object" ||
    options === null ||
    !isTimerOption(options.timer) ||
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
    candidate.endReason !== null &&
    candidate.endReason !== "completed" &&
    candidate.endReason !== "timeout" &&
    candidate.endReason !== "gave-up" &&
    candidate.endReason !== "failed" &&
    candidate.endReason !== "abandoned"
  ) {
    return false;
  }

  if (
    !Array.isArray(candidate.gridIds) ||
    candidate.gridIds.length !== GRID_SIZE
  ) {
    return false;
  }

  for (const id of candidate.gridIds) {
    if (typeof id !== "string" || !VALID_TAXON_IDS.has(id)) {
      console.warn(
        `[TaxoBingo] Stored daily state contains unknown taxon id "${String(id)}"; resetting progress.`
      );
      return false;
    }
  }

  if (typeof candidate.placements !== "object" || candidate.placements === null) {
    return false;
  }

  for (const [taxonId, orgId] of Object.entries(
    candidate.placements as Record<string, unknown>
  )) {
    if (
      !VALID_TAXON_IDS.has(taxonId) ||
      typeof orgId !== "string" ||
      !VALID_ORGANISM_IDS.has(orgId)
    ) {
      console.warn(
        `[TaxoBingo] Stored daily placement "${taxonId} -> ${String(orgId)}" is unknown in catalog; resetting progress.`
      );
      return false;
    }
  }

  if (typeof candidate.mistakes !== "number" || candidate.mistakes < 0) {
    return false;
  }
  if (typeof candidate.skips !== "number" || candidate.skips < 0) {
    return false;
  }

  return true;
}

export function createDailyState(
  dayKey: string,
  options: TaxoGameOptions,
  now: number
): TaxoDailyState {
  const resolvedTimer = resolveTimerForHardMode(
    options.timer,
    options.hardMode
  );
  const seed = dailySeed(TAXO_SLUG, dayKey);
  const gridIds = generateGrid(createRng(seed));

  return {
    version: 1,
    dayKey,
    options: {
      timer: resolvedTimer,
      hardMode: options.hardMode,
    },
    status: "playing",
    startedAt: now,
    deadline: resolvedTimer !== null ? now + resolvedTimer * 1000 : null,
    endedAt: null,
    endReason: null,
    gridIds,
    placements: {},
    mistakes: 0,
    skips: 0,
  };
}

/**
 * Restore and reconcile a saved TaxoDailyState against todayKey and now.
 * - Invalid/unknown version or unknown catalog IDs -> discarded (state: null).
 * - Same day, playing, past deadline -> finalized as timeout loss (mustRecord: true).
 * - Same day, playing, before deadline -> resumed directly (mustRecord: false).
 * - Same day, finished -> returned as-is (mustRecord: false).
 * - Previous day, playing (abandoned) -> finalized as loss for its own dayKey (mustRecord: true, abandonedState set, state: null for today's menu).
 * - Previous day, finished -> state: null, mustRecord: false.
 */
export function restoreDailyState(
  saved: unknown,
  todayKey: string,
  now: number
): RestoreDailyResult {
  if (!isValidTaxoDailyState(saved)) {
    return { state: null, mustRecord: false, abandonedState: null };
  }

  if (saved.dayKey === todayKey) {
    if (saved.status === "playing") {
      if (saved.deadline !== null && now >= saved.deadline) {
        const timedOut: TaxoDailyState = {
          ...saved,
          status: "lost",
          endedAt: saved.deadline,
          endReason: "timeout",
        };
        return { state: timedOut, mustRecord: true, abandonedState: null };
      }
      return { state: saved, mustRecord: false, abandonedState: null };
    }
    return { state: saved, mustRecord: false, abandonedState: null };
  }

  // saved.dayKey !== todayKey
  if (saved.status === "playing") {
    const abandoned: TaxoDailyState = {
      ...saved,
      status: "lost",
      endedAt: now,
      endReason: "abandoned",
    };
    return { state: null, mustRecord: true, abandonedState: abandoned };
  }

  return { state: null, mustRecord: false, abandonedState: null };
}

export function loadSavedTaxoDaily(): unknown {
  return readJSON<unknown>(storageKey(TAXO_SLUG, DAILY_STORAGE_SUFFIX), null);
}

export function saveTaxoDaily(state: TaxoDailyState): void {
  writeJSON(storageKey(TAXO_SLUG, DAILY_STORAGE_SUFFIX), state);
}

export function clearTaxoDaily(): void {
  removeItem(storageKey(TAXO_SLUG, DAILY_STORAGE_SUFFIX));
}

export function recordTaxoDailyStats(state: TaxoDailyState): GameStats {
  const current = loadStats(TAXO_SLUG);
  const filledCount = Object.keys(state.placements).length;
  const updated = applyResult(current, {
    dayKey: state.dayKey,
    won: state.status === "won",
    bucket: String(filledCount),
  });
  saveStats(TAXO_SLUG, updated);
  return updated;
}
