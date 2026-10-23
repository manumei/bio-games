import type { Answer } from "@/games/bio-wordle/data/answers";
import type { WordleDailyState } from "@/games/bio-wordle/logic/daily";

export type TileEval = "correct" | "present" | "absent";
export type TileVisualState = "empty" | "typed" | TileEval;

export type WordlePhase = "menu" | "playing" | "over";
export type WordleMode = "daily" | "practice";

export interface WordleOptions {
  hardMode: boolean;
}

export interface WordleGameState {
  mode: WordleMode;
  dayKey: string | null;
  seed: number;
  phase: WordlePhase;
  options: WordleOptions;
  answer: Answer;
  guesses: string[];
  evaluations: TileEval[][];
  currentGuess: string;
  hintUsed: boolean;
  endedAt: number | null;
  modalOpen: boolean;
  shakeNonce: number;
  dailyFinishedForToday: boolean;
}

export type WordleAction =
  | { type: "SET_OPTIONS"; hardMode: boolean }
  | {
      type: "START";
      mode: WordleMode;
      dayKey: string | null;
      seed: number;
      answer: Answer;
    }
  | {
      type: "HYDRATE_DAILY";
      dailyState: WordleDailyState;
      answer: Answer;
      seed: number;
    }
  | { type: "TYPE_LETTER"; letter: string }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT_ACCEPTED"; guess: string; now: number }
  | { type: "TRIGGER_SHAKE" }
  | { type: "USE_HINT" }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_MODAL" };

