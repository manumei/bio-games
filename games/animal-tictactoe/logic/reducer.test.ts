import { describe, expect, it } from "vitest";
import { HARD_GUESSES, NORMAL_GUESSES } from "../config";
import type { TicTacState } from "../types";
import { createInitialState, ticTacReducer } from "./reducer";

function startTestGame(hardMode = false): TicTacState {
  // rows: ["mammal", "bird", "reptile"]
  // cols: ["carnivorous", "herbivore", "africa"]
  const initial = createInitialState({ hardMode });
  return ticTacReducer(initial, {
    type: "START_GAME",
    seed: 100,
    options: { hardMode },
    rows: ["mammal", "bird", "reptile"],
    cols: ["carnivorous", "herbivore", "africa"],
  });
}

describe("ticTacReducer", () => {
  it("1. unknown animal text does not consume a guess", () => {
    const s0 = startTestGame(false);
    expect(s0.guessesLeft).toBe(NORMAL_GUESSES);
    const s1 = ticTacReducer(s0, {
      type: "SUBMIT_GUESS",
      text: "Unicorn",
    });
    expect(s1.guessesLeft).toBe(NORMAL_GUESSES);
    expect(s1.guessesUsed).toBe(0);
    expect(s1.message).toBe("Unicorn isn't in our animal list");
  });

  it("2. hard mode rejects already-used animal without consuming a guess", () => {
    let s = startTestGame(true);
    expect(s.guessesLeft).toBe(HARD_GUESSES);

    // Gray Wolf is mammal + carnivorous (not africa) -> fits exactly 1 cell (row 0, col 0)
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Gray Wolf" });
    expect(s.cells[0]).toBe("gray_wolf");
    expect(s.guessesLeft).toBe(HARD_GUESSES - 1);

    // Submitting Gray Wolf again in hard mode is blocked without consuming a guess
    const s2 = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Gray Wolf" });
    expect(s2.guessesLeft).toBe(HARD_GUESSES - 1);
    expect(s2.message).toBe("Already used Gray Wolf");
  });

  it("3. known animal that fits no empty cell consumes a guess", () => {
    let s = startTestGame(false);
    // Monarch Butterfly is insect + herbivore + north_america -> fits 0 cells on (mammal/bird/reptile)
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Monarch Butterfly" });
    expect(s.guessesLeft).toBe(NORMAL_GUESSES - 1);
    expect(s.guessesUsed).toBe(1);
    expect(s.message).toBe("Monarch Butterfly does not fit the grid");
  });

  it("4. known animal fitting exactly one empty cell fills it immediately and consumes a guess", () => {
    let s = startTestGame(false);
    // Gray Wolf fits only (mammal, carnivorous) = cell 0
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Timber Wolf" }); // alias test!
    expect(s.cells[0]).toBe("gray_wolf");
    expect(s.guessesLeft).toBe(NORMAL_GUESSES - 1);
    expect(s.guessesUsed).toBe(1);
    expect(s.message).toBe("Gray Wolf has been added!");
  });

  it("5. known animal fitting several empty cells enters pending state; pick fills & consumes, cancel does not", () => {
    const s0 = startTestGame(false);
    // Lion is mammal + carnivorous + africa -> fits cell 0 (mammal, carnivorous) and cell 2 (mammal, africa)
    const sPending = ticTacReducer(s0, { type: "SUBMIT_GUESS", text: "Lion" });
    expect(sPending.pending).toEqual({
      animalId: "lion",
      candidateCells: [0, 2],
    });
    expect(sPending.guessesLeft).toBe(NORMAL_GUESSES);
    expect(sPending.message).toBe("Lion fits 2 cells, click one to place it");

    // While pending, submitting another guess is ignored
    const sIgnored = ticTacReducer(sPending, {
      type: "SUBMIT_GUESS",
      text: "Gray Wolf",
    });
    expect(sIgnored).toBe(sPending);

    // Cancel clears pending without consuming a guess
    const sCancelled = ticTacReducer(sPending, { type: "CANCEL_PICK" });
    expect(sCancelled.pending).toBeNull();
    expect(sCancelled.guessesLeft).toBe(NORMAL_GUESSES);
    expect(sCancelled.message).toBeNull();

    // Re-submit Lion and pick cell 2
    const sPending2 = ticTacReducer(sCancelled, {
      type: "SUBMIT_GUESS",
      text: "Lion",
    });
    const sPicked = ticTacReducer(sPending2, {
      type: "PICK_CELL",
      cellIndex: 2,
    });
    expect(sPicked.pending).toBeNull();
    expect(sPicked.cells[2]).toBe("lion");
    expect(sPicked.guessesLeft).toBe(NORMAL_GUESSES - 1);
    expect(sPicked.message).toBe("Lion has been added!");
  });

  it("allows repeats in normal mode across separate submissions", () => {
    let s = startTestGame(false);
    // Submit Lion -> fits [0, 2] -> pick 2
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Lion" });
    s = ticTacReducer(s, { type: "PICK_CELL", cellIndex: 2 });
    expect(s.cells[2]).toBe("lion");

    // Submit Lion again in normal mode -> now only cell 0 is empty -> fills cell 0 directly!
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Lion" });
    expect(s.cells[0]).toBe("lion");
    expect(s.guessesUsed).toBe(2);
  });

  it("wins when all 9 cells are filled and blocks further input", () => {
    let s = startTestGame(false);
    // Pre-fill 8 cells, leave cell 0 (mammal, carnivorous) empty
    s = {
      ...s,
      cells: [
        null,
        "koala",
        "lion",
        "bald_eagle",
        "macaw",
        "ostrich",
        "komodo_dragon",
        "green_iguana",
        "nile_crocodile",
      ],
      guessesLeft: 7,
      guessesUsed: 8,
    };
    s = ticTacReducer(s, { type: "SUBMIT_GUESS", text: "Gray Wolf" });
    expect(s.phase).toBe("over");
    expect(s.outcome).toBe("completed");
    expect(s.endMessage).toBeTruthy();

    // Further input after game over is ignored
    const afterOver = ticTacReducer(s, {
      type: "SUBMIT_GUESS",
      text: "Lion",
    });
    expect(afterOver).toBe(s);
  });

  it("loses when guess budget reaches 0 with empty cells", () => {
    let s = startTestGame(true);
    s = {
      ...s,
      guessesLeft: 1,
      guessesUsed: HARD_GUESSES - 1,
    };
    s = ticTacReducer(s, {
      type: "SUBMIT_GUESS",
      text: "Monarch Butterfly",
    });
    expect(s.phase).toBe("over");
    expect(s.outcome).toBe("failed");
    expect(s.guessesLeft).toBe(0);
  });

  it("transitions to gave-up on GIVE_UP", () => {
    const s0 = startTestGame(false);
    const s1 = ticTacReducer(s0, { type: "GIVE_UP" });
    expect(s1.phase).toBe("over");
    expect(s1.outcome).toBe("gave-up");
    expect(s1.endMessage).toBeTruthy();
  });
});

