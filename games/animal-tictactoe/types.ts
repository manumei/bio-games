import type { DailyEndReason } from "@/lib/daily";

export type TicTacPhase = "menu" | "playing" | "versus" | "over";

export type TicTacOutcome = DailyEndReason;

export interface TicTacOptions {
  hardMode: boolean;
  daily: boolean;
  versus: boolean;
  versusTimer: boolean;
}

export interface PendingSelection {
  animalId: string;
  candidateCells: number[];
}

export interface TicTacState {
  phase: TicTacPhase;
  options: TicTacOptions;
  seed: number;
  rows: [string, string, string];
  cols: [string, string, string];
  cells: (string | null)[];
  guessesLeft: number;
  guessesUsed: number;
  used: string[];
  pending: PendingSelection | null;
  message: string | null;
  outcome: TicTacOutcome | null;
  endMessage: string | null;
  hardModeNotice: string | null;
}

