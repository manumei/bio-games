import { MAX_STAGE } from "@/games/symptoms-link/config";
import { DISEASES } from "@/games/symptoms-link/data/diseases";
import { diseaseFor } from "@/games/symptoms-link/logic/schedule";
import type { LinkLogEntry, LinkOptions } from "@/games/symptoms-link/types";
import type { DailyStateBase } from "@/lib/daily";
import { applyResult, loadStats, saveStats, type GameStats } from "@/lib/stats";
import { readJSON, storageKey, writeJSON } from "@/lib/storage";

export const LINK_SLUG = "symptoms-link";
const DAILY_STORAGE_SUFFIX = "daily";

const VALID_DISEASE_IDS = new Set<string>(DISEASES.map((d) => d.id));

export interface LinkDailyState extends DailyStateBase<LinkOptions> {
  diseaseId: string;
  stage: number; // 1..5
  log: LinkLogEntry[];
}

export interface RestoreLinkDailyResult {
  state: LinkDailyState | null;
  mustRecord: boolean;
  abandonedState: LinkDailyState | null;
}

export function isValidLinkDailyState(value: unknown): value is LinkDailyState {
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
  if (
    typeof candidate.diseaseId !== "string" ||
    !VALID_DISEASE_IDS.has(candidate.diseaseId)
  ) {
    return false;
  }

  if (
    typeof candidate.stage !== "number" ||
    candidate.stage < 1 ||
    candidate.stage > MAX_STAGE
  ) {
    return false;
  }

  if (!Array.isArray(candidate.log)) return false;
  for (const item of candidate.log) {
    if (typeof item !== "object" || item === null) return false;
    const entry = item as Record<string, unknown>;
    if (entry.kind !== "wrong" && entry.kind !== "skip") return false;
  }

  return true;
}

export function createDailyState(
  dayKey: string,
  options: LinkOptions,
  now: number
): LinkDailyState {
  const disease = diseaseFor(dayKey);
  return {
    version: 1,
    dayKey,
    options: { hardMode: options.hardMode },
    status: "playing",
    startedAt: now,
    deadline: null,
    endedAt: null,
    endReason: null,
    diseaseId: disease.id,
    stage: 1,
    log: [],
  };
}

export function restoreDailyState(
  saved: unknown,
  todayKey: string,
  now: number
): RestoreLinkDailyResult {
  if (!isValidLinkDailyState(saved)) {
    return { state: null, mustRecord: false, abandonedState: null };
  }

  if (saved.dayKey === todayKey) {
    return { state: saved, mustRecord: false, abandonedState: null };
  }

  if (saved.status === "playing") {
    const abandoned: LinkDailyState = {
      ...saved,
      status: "lost",
      endedAt: now,
      endReason: "abandoned",
    };
    return { state: null, mustRecord: true, abandonedState: abandoned };
  }

  return { state: null, mustRecord: false, abandonedState: null };
}

export function loadSavedLinkDaily(): unknown {
  return readJSON<unknown>(storageKey(LINK_SLUG, DAILY_STORAGE_SUFFIX), null);
}

export function saveLinkDaily(state: LinkDailyState): void {
  writeJSON(storageKey(LINK_SLUG, DAILY_STORAGE_SUFFIX), state);
}

export function recordLinkDailyStats(state: LinkDailyState): GameStats {
  const current = loadStats(LINK_SLUG);
  const won = state.status === "won";
  const bucket = won ? String(state.stage) : "X";
  const updated = applyResult(current, {
    dayKey: state.dayKey,
    won,
    bucket,
  });
  saveStats(LINK_SLUG, updated);
  return updated;
}
