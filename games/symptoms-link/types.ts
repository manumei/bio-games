import type { Disease } from "@/games/symptoms-link/data/diseases";
import type { LinkDailyState } from "@/games/symptoms-link/logic/daily";

export type LinkPhase = "menu" | "playing" | "over";
export type LinkMode = "daily" | "practice";

export interface LinkOptions {
  hardMode: boolean;
}

export interface LinkLogEntry {
  kind: "wrong" | "skip";
  diseaseId?: string;
}

export interface LinkGameState {
  mode: LinkMode;
  dayKey: string | null;
  seed: number;
  phase: LinkPhase;
  options: LinkOptions;
  disease: Disease;
  stage: number; // 1..5
  log: LinkLogEntry[];
  won: boolean;
  endedAt: number | null;
  modalOpen: boolean;
  dailyFinishedForToday: boolean;
}

export type LinkAction =
  | { type: "SET_OPTIONS"; hardMode: boolean }
  | {
      type: "START";
      mode: LinkMode;
      dayKey: string | null;
      seed: number;
      disease: Disease;
    }
  | {
      type: "HYDRATE_DAILY";
      dailyState: LinkDailyState;
      disease: Disease;
      seed: number;
    }
  | { type: "GUESS"; diseaseId: string; now: number }
  | { type: "SKIP" }
  | { type: "GIVE_UP"; now: number }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_MODAL" };

