import { describe, expect, it } from "vitest";
import { getAnswer } from "@/games/bio-wordle/data/answers";
import {
  createInitialWordleState,
  validateCurrentGuess,
  wordleReducer,
} from "@/games/bio-wordle/logic/reducer";

describe("games/bio-wordle/logic/reducer", () => {
  const sampleAnswer = getAnswer("xylem")!;
  const allowed = new Set(["xylem", "spore", "clade", "flora", "plant", "genes", "lipid"]);

  it("handles typing, backspace, invalid guess rejection without consuming a guess, and winning", () => {
    let state = wordleReducer(createInitialWordleState(), {
      type: "START",
      mode: "practice",
      dayKey: null,
      seed: 10,
      answer: sampleAnswer,
    });

    // Type 3 letters -> Not enough letters
    for (const ch of "xyl") {
      state = wordleReducer(state, { type: "TYPE_LETTER", letter: ch });
    }
    expect(validateCurrentGuess(state, allowed)).toBe("Not enough letters");
    expect(state.guesses).toHaveLength(0);

    // Backspace removes last letter
    state = wordleReducer(state, { type: "BACKSPACE" });
    expect(state.currentGuess).toBe("xy");

    // Type non-dictionary 5-letter word -> Not in word list
    state = { ...state, currentGuess: "zzzzz" };
    expect(validateCurrentGuess(state, allowed)).toBe("Not in word list");
    expect(state.guesses).toHaveLength(0);

    // Submit valid wrong guess
    state = { ...state, currentGuess: "spore" };
    expect(validateCurrentGuess(state, allowed)).toBeNull();
    state = wordleReducer(state, {
      type: "SUBMIT_ACCEPTED",
      guess: "spore",
      now: 1000,
    });
    expect(state.guesses).toEqual(["spore"]);
    expect(state.phase).toBe("playing");

    // Submit correct answer -> wins and ignores further typing
    state = { ...state, currentGuess: "xylem" };
    expect(validateCurrentGuess(state, allowed)).toBeNull();
    state = wordleReducer(state, {
      type: "SUBMIT_ACCEPTED",
      guess: "xylem",
      now: 2000,
    });
    expect(state.phase).toBe("over");
    expect(state.modalOpen).toBe(true);

    // Input ignored after game over
    const afterType = wordleReducer(state, { type: "TYPE_LETTER", letter: "a" });
    expect(afterType.currentGuess).toBe("");
  });

  it("transitions to loss after 6 wrong guesses", () => {
    let state = wordleReducer(createInitialWordleState(), {
      type: "START",
      mode: "daily",
      dayKey: "2026-04-17",
      seed: 42,
      answer: sampleAnswer,
    });

    const wrongWords = ["spore", "clade", "flora", "plant", "genes", "lipid"];
    for (let i = 0; i < wrongWords.length; i++) {
      state = wordleReducer(state, {
        type: "SUBMIT_ACCEPTED",
        guess: wrongWords[i]!,
        now: 1000 + i * 100,
      });
    }

    expect(state.guesses).toHaveLength(6);
    expect(state.phase).toBe("over");
    expect(state.modalOpen).toBe(true);
    expect(state.dailyFinishedForToday).toBe(true);
  });
});
