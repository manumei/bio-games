import { MAX_GUESSES } from "@/games/bio-wordle/config";
import { WORDLE_ANSWERS } from "@/games/bio-wordle/data/answers";
import { checkHardMode } from "@/games/bio-wordle/logic/hardMode";
import { scoreGuess } from "@/games/bio-wordle/logic/score";
import { isValidGuess } from "@/games/bio-wordle/logic/validate";
import type { WordleAction, WordleGameState } from "@/games/bio-wordle/types";

export function createInitialWordleState(): WordleGameState {
  return {
    mode: "daily",
    dayKey: null,
    seed: 1,
    phase: "menu",
    options: { hardMode: false },
    answer: WORDLE_ANSWERS[0]!,
    guesses: [],
    evaluations: [],
    currentGuess: "",
    hintUsed: false,
    endedAt: null,
    modalOpen: false,
    shakeNonce: 0,
    dailyFinishedForToday: false,
  };
}

/**
 * Validate the current guess before accepting it.
 * Returns null if valid, or a user-facing toast message if invalid.
 */
export function validateCurrentGuess(
  state: WordleGameState,
  allowedSet: ReadonlySet<string> | null
): string | null {
  if (state.phase !== "playing") return "Game over";
  const targetLen = state.answer.word.length;
  if (state.currentGuess.length < targetLen) {
    return "Not enough letters";
  }
  if (!isValidGuess(state.currentGuess, allowedSet, targetLen)) {
    return "Not in word list";
  }
  if (state.options.hardMode) {
    const hardError = checkHardMode(
      state.currentGuess,
      state.guesses,
      state.evaluations
    );
    if (hardError) {
      return hardError;
    }
  }
  return null;
}

export function wordleReducer(
  state: WordleGameState,
  action: WordleAction
): WordleGameState {
  switch (action.type) {
    case "SET_OPTIONS": {
      return {
        ...state,
        options: { hardMode: action.hardMode },
      };
    }

    case "START": {
      return {
        ...state,
        mode: action.mode,
        dayKey: action.dayKey,
        seed: action.seed,
        phase: "playing",
        answer: action.answer,
        guesses: [],
        evaluations: [],
        currentGuess: "",
        hintUsed: false,
        endedAt: null,
        modalOpen: false,
        shakeNonce: 0,
      };
    }

    case "HYDRATE_DAILY": {
      const { dailyState, answer, seed } = action;
      const evaluations = dailyState.guesses.map((g) =>
        scoreGuess(g, answer.word)
      );
      const isOver = dailyState.status !== "playing";

      return {
        ...state,
        mode: "daily",
        dayKey: dailyState.dayKey,
        seed,
        phase: isOver ? "over" : "playing",
        options: dailyState.options,
        answer,
        guesses: dailyState.guesses,
        evaluations,
        currentGuess: "",
        hintUsed: dailyState.hintUsed,
        endedAt: dailyState.endedAt,
        modalOpen: isOver,
        shakeNonce: 0,
        dailyFinishedForToday: isOver,
      };
    }

    case "TYPE_LETTER": {
      if (state.phase !== "playing") return state;
      const ch = action.letter.toLowerCase();
      if (!/^[a-z]$/.test(ch)) return state;
      if (state.currentGuess.length >= state.answer.word.length) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + ch,
      };
    }

    case "BACKSPACE": {
      if (state.phase !== "playing") return state;
      if (state.currentGuess.length === 0) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
      };
    }

    case "TRIGGER_SHAKE": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        shakeNonce: state.shakeNonce + 1,
      };
    }

    case "SUBMIT_ACCEPTED": {
      if (state.phase !== "playing") return state;
      const guess = action.guess.toLowerCase();
      const evaluation = scoreGuess(guess, state.answer.word);
      const nextGuesses = [...state.guesses, guess];
      const nextEvaluations = [...state.evaluations, evaluation];
      const won = guess === state.answer.word;
      const lost = !won && nextGuesses.length >= MAX_GUESSES;
      const isOver = won || lost;

      return {
        ...state,
        guesses: nextGuesses,
        evaluations: nextEvaluations,
        currentGuess: "",
        phase: isOver ? "over" : "playing",
        endedAt: isOver ? action.now : null,
        modalOpen: isOver,
        dailyFinishedForToday:
          isOver && state.mode === "daily" ? true : state.dailyFinishedForToday,
      };
    }

    case "USE_HINT": {
      if (state.phase !== "playing" || state.options.hardMode) return state;
      return {
        ...state,
        hintUsed: true,
      };
    }

    case "CLOSE_MODAL": {
      return {
        ...state,
        modalOpen: false,
      };
    }

    case "OPEN_MODAL": {
      return {
        ...state,
        modalOpen: true,
      };
    }
  }
}

