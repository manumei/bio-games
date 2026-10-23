import type { DailyEndReason } from "@/lib/daily";
import { createRng } from "@/lib/rng";
import { findExact } from "@/lib/text";
import { CELL_LABELS, PASS_SCORE } from "../config";
import { PARTS, getPart, type CellType } from "../data/parts";
import {
  UNKNOWN_PART_TOAST,
  getCellFollowUpMessage,
  pickCellEndMessage,
} from "./messages";
import { generateRound, type CellQuestion } from "./questions";

export type CellPhase = "menu" | "playing" | "over";

export interface CellOptions {
  hardMode: boolean;
  daily: boolean;
}

export interface CellAnswerRecord {
  correct: boolean;
  given: string | null;
}

export interface CellState {
  phase: CellPhase;
  options: CellOptions;
  seed: number;
  questions: CellQuestion[];
  currentIndex: number;
  answers: CellAnswerRecord[];
  awaitingNext: boolean;
  feedback: string | null;
  toastMessage: string | null;
  score: number;
  passed: boolean;
  outcome: DailyEndReason | null;
  endMessage: string | null;
  hardModeNotice: string | null;
}

export type CellAction =
  | {
      type: "START_ROUND";
      seed: number;
      options?: Partial<CellOptions>;
      questions?: CellQuestion[];
    }
  | { type: "SET_OPTIONS"; options: Partial<CellOptions> }
  | { type: "ANSWER_PART"; partId: string }
  | { type: "ANSWER_TEXT"; text: string }
  | { type: "ANSWER_CELL"; cell: CellType }
  | { type: "NEXT_QUESTION" }
  | { type: "GIVE_UP" }
  | { type: "BACK_TO_MENU" }
  | { type: "HYDRATE_STATE"; state: CellState };

export const DEFAULT_CELL_OPTIONS: CellOptions = {
  hardMode: false,
  daily: false,
};

export function createInitialCellState(
  partial?: Partial<CellOptions>,
): CellState {
  return {
    phase: "menu",
    options: { ...DEFAULT_CELL_OPTIONS, ...partial },
    seed: 1,
    questions: [],
    currentIndex: 0,
    answers: [],
    awaitingNext: false,
    feedback: null,
    toastMessage: null,
    score: 0,
    passed: false,
    outcome: null,
    endMessage: null,
    hardModeNotice: null,
  };
}

function buildPartFeedback(correct: boolean, targetPartId: string): string {
  const part = getPart(targetPartId);
  if (correct) {
    return `✅ ${part.name}: ${part.fn}`;
  }
  return `❌ It was the ${part.name}: ${part.fn}`;
}

function buildClassifyFeedback(
  correct: boolean,
  targetCell: CellType,
  partId: string,
): string {
  const part = getPart(partId);
  const cellLabel = CELL_LABELS[targetCell];
  if (correct) {
    return `✅ ${cellLabel} (${part.name}): ${part.fn}`;
  }
  return `❌ It was the ${cellLabel} (${part.name}): ${part.fn}`;
}

export function cellReducer(state: CellState, action: CellAction): CellState {
  switch (action.type) {
    case "HYDRATE_STATE":
      return action.state;

    case "SET_OPTIONS": {
      if (state.phase !== "menu") return state;
      return {
        ...state,
        options: { ...state.options, ...action.options },
      };
    }

    case "BACK_TO_MENU":
      return createInitialCellState(state.options);

    case "START_ROUND": {
      const options: CellOptions = {
        ...state.options,
        ...action.options,
      };
      const questions =
        action.questions ??
        generateRound(createRng(action.seed), options.hardMode);
      return {
        phase: "playing",
        options,
        seed: action.seed,
        questions,
        currentIndex: 0,
        answers: [],
        awaitingNext: false,
        feedback: null,
        toastMessage: null,
        score: 0,
        passed: false,
        outcome: null,
        endMessage: null,
        hardModeNotice: null,
      };
    }

    case "ANSWER_PART": {
      if (state.phase !== "playing" || state.awaitingNext) return state;
      const q = state.questions[state.currentIndex];
      if (!q || q.type === "classify") return state;

      const correct = action.partId === q.partId;
      const nextAnswers: CellAnswerRecord[] = [
        ...state.answers,
        { correct, given: action.partId },
      ];
      const nextScore = state.score + (correct ? 1 : 0);

      return {
        ...state,
        answers: nextAnswers,
        score: nextScore,
        awaitingNext: true,
        feedback: buildPartFeedback(correct, q.partId),
        toastMessage: null,
      };
    }

    case "ANSWER_TEXT": {
      if (state.phase !== "playing" || state.awaitingNext) return state;
      const q = state.questions[state.currentIndex];
      if (!q || q.type !== "name") return state;

      const trimmed = action.text.trim();
      if (!trimmed) return state;

      const matched = findExact(PARTS, trimmed);
      if (!matched) {
        return {
          ...state,
          toastMessage: UNKNOWN_PART_TOAST,
        };
      }

      const correct = matched.id === q.partId;
      const nextAnswers: CellAnswerRecord[] = [
        ...state.answers,
        { correct, given: matched.id },
      ];
      const nextScore = state.score + (correct ? 1 : 0);

      return {
        ...state,
        answers: nextAnswers,
        score: nextScore,
        awaitingNext: true,
        feedback: buildPartFeedback(correct, q.partId),
        toastMessage: null,
      };
    }

    case "ANSWER_CELL": {
      if (state.phase !== "playing" || state.awaitingNext) return state;
      const q = state.questions[state.currentIndex];
      if (!q || q.type !== "classify") return state;

      const correct = action.cell === q.cell;
      const nextAnswers: CellAnswerRecord[] = [
        ...state.answers,
        { correct, given: action.cell },
      ];
      const nextScore = state.score + (correct ? 1 : 0);

      return {
        ...state,
        answers: nextAnswers,
        score: nextScore,
        awaitingNext: true,
        feedback: buildClassifyFeedback(correct, q.cell, q.partId),
        toastMessage: null,
      };
    }

    case "NEXT_QUESTION": {
      if (state.phase !== "playing" || !state.awaitingNext) return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex < state.questions.length) {
        return {
          ...state,
          currentIndex: nextIndex,
          awaitingNext: false,
          feedback: null,
          toastMessage: null,
        };
      }

      const passed = state.score >= PASS_SCORE;
      return {
        ...state,
        phase: "over",
        awaitingNext: false,
        passed,
        outcome: passed ? "completed" : "failed",
        endMessage: pickCellEndMessage(state.score, state.seed),
        hardModeNotice: getCellFollowUpMessage(passed, state.options.hardMode),
      };
    }

    case "GIVE_UP": {
      if (state.phase !== "playing") return state;
      const paddedAnswers: CellAnswerRecord[] = [...state.answers];
      while (paddedAnswers.length < state.questions.length) {
        paddedAnswers.push({ correct: false, given: null });
      }
      const passed = state.score >= PASS_SCORE;
      return {
        ...state,
        phase: "over",
        answers: paddedAnswers,
        awaitingNext: false,
        passed,
        outcome: "gave-up",
        endMessage: pickCellEndMessage(state.score, state.seed),
        hardModeNotice: getCellFollowUpMessage(passed, state.options.hardMode),
      };
    }

    default:
      return state;
  }
}

