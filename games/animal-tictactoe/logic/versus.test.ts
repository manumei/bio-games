import { describe, expect, it } from "vitest";
import { createVersusState, versusReducer } from "./versus";

describe("versusReducer", () => {
  const grid = {
    rows: ["mammal", "bird", "reptile"] as [string, string, string],
    cols: ["carnivorous", "herbivore", "africa"] as [string, string, string],
  };

  it("claims a valid cell and switches turn", () => {
    let s = createVersusState(1, grid);
    expect(s.turn).toBe("X");
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 0 });
    expect(s.selectedCell).toBe(0);

    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Gray Wolf" });
    expect(s.cells[0]).toEqual({ animalId: "gray_wolf", mark: "X" });
    expect(s.turn).toBe("O");
    expect(s.selectedCell).toBeNull();
  });

  it("passes turn on invalid or unknown animal", () => {
    let s = createVersusState(1, grid);
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 0 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Dragon" });
    expect(s.cells[0]).toBeNull();
    expect(s.turn).toBe("O");
    expect(s.message).toBe("Wrong! ⭕'s turn");

    // Known animal that doesn't fit cell 0 (mammal + carnivorous)
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 0 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Koala" });
    expect(s.cells[0]).toBeNull();
    expect(s.turn).toBe("X");
    expect(s.message).toBe("Wrong! ❌'s turn");
  });

  it("forbids repeated animals and passes turn", () => {
    let s = createVersusState(1, grid);
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 0 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Lion" });
    expect(s.cells[0]?.animalId).toBe("lion");

    // Player O tries to use Lion on cell 2
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 2 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Lion" });
    expect(s.cells[2]).toBeNull();
    expect(s.turn).toBe("X");
    expect(s.message).toContain("Already used Lion");
  });

  it("detects 3-in-a-row win", () => {
    let s = createVersusState(1, grid);
    // X claims 0 (Lion)
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 0 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Lion" });
    // O misses
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 3 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Nope" });
    // X claims 1 (Koala: mammal + herbivore)
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 1 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Koala" });
    // O misses
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 3 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Nope" });
    // X claims 2 (Giraffe: mammal + africa) -> top row [0, 1, 2] complete!
    s = versusReducer(s, { type: "SELECT_CELL", cellIndex: 2 });
    s = versusReducer(s, { type: "SUBMIT_VERSUS", text: "Giraffe" });

    expect(s.winner).toBe("X");
    expect(s.winningLine).toEqual([0, 1, 2]);
  });

  it("passes turn on TIMEOUT_TURN", () => {
    const s0 = createVersusState(1, grid);
    const s1 = versusReducer(s0, { type: "TIMEOUT_TURN" });
    expect(s1.turn).toBe("O");
    expect(s1.message).toBe("Time's up! ⭕'s turn");
  });
});

