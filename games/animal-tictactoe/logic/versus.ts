import { createRng } from "@/lib/rng";
import { findExact } from "@/lib/text";
import { GRID_CELL_COUNT } from "../config";
import {
  ANIMALS,
  toSearchableAnimals,
  type Animal,
} from "../data/animals";
import { TRAITS } from "../data/traits";
import { generateGrid } from "./grid";

export type VersusMark = "X" | "O";

export interface VersusCell {
  animalId: string;
  mark: VersusMark;
}

export interface VersusState {
  seed: number;
  rows: [string, string, string];
  cols: [string, string, string];
  cells: (VersusCell | null)[];
  turn: VersusMark;
  selectedCell: number | null;
  used: string[];
  winner: VersusMark | "draw" | null;
  winningLine: number[] | null;
  message: string | null;
  turnCount: number;
}

export type VersusAction =
  | {
      type: "START_VERSUS";
      seed: number;
      rows?: [string, string, string];
      cols?: [string, string, string];
    }
  | { type: "SELECT_CELL"; cellIndex: number }
  | { type: "SUBMIT_VERSUS"; text: string; animals?: readonly Animal[] }
  | { type: "TIMEOUT_TURN" };

const WINNING_LINES: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function markSymbol(mark: VersusMark): string {
  return mark === "X" ? "❌" : "⭕";
}

export function nextMark(mark: VersusMark): VersusMark {
  return mark === "X" ? "O" : "X";
}

function findWinner(
  cells: readonly (VersusCell | null)[],
): { winner: VersusMark; line: number[] } | null {
  for (const [a, b, c] of WINNING_LINES) {
    const m = cells[a]?.mark;
    if (m && cells[b]?.mark === m && cells[c]?.mark === m) {
      return { winner: m, line: [a, b, c] };
    }
  }
  return null;
}

export function createVersusState(
  seed: number,
  customGrid?: { rows: [string, string, string]; cols: [string, string, string] },
): VersusState {
  const grid = customGrid ?? generateGrid(createRng(seed), ANIMALS, TRAITS);
  return {
    seed,
    rows: grid.rows,
    cols: grid.cols,
    cells: Array<VersusCell | null>(GRID_CELL_COUNT).fill(null),
    turn: "X",
    selectedCell: null,
    used: [],
    winner: null,
    winningLine: null,
    message: "Player ❌: click an empty cell to start!",
    turnCount: 0,
  };
}

export function versusReducer(
  state: VersusState,
  action: VersusAction,
): VersusState {
  switch (action.type) {
    case "START_VERSUS":
      return createVersusState(
        action.seed,
        action.rows && action.cols
          ? { rows: action.rows, cols: action.cols }
          : undefined,
      );

    case "SELECT_CELL": {
      if (state.winner !== null) return state;
      if (action.cellIndex < 0 || action.cellIndex >= GRID_CELL_COUNT) {
        return state;
      }
      if (state.cells[action.cellIndex] !== null) return state;
      return {
        ...state,
        selectedCell: action.cellIndex,
        message: `Player ${markSymbol(state.turn)}: type an animal for the selected cell`,
      };
    }

    case "TIMEOUT_TURN": {
      if (state.winner !== null) return state;
      const next = nextMark(state.turn);
      return {
        ...state,
        turn: next,
        selectedCell: null,
        turnCount: state.turnCount + 1,
        message: `Time's up! ${markSymbol(next)}'s turn`,
      };
    }

    case "SUBMIT_VERSUS": {
      if (state.winner !== null) return state;
      if (state.selectedCell === null) {
        return {
          ...state,
          message: `Player ${markSymbol(state.turn)}: click an empty cell first!`,
        };
      }
      const trimmed = action.text.trim();
      if (!trimmed) return state;

      const pool = action.animals
        ? toSearchableAnimals(action.animals)
        : ANIMALS;
      const found = findExact(pool, trimmed);
      const next = nextMark(state.turn);

      if (!found) {
        return {
          ...state,
          turn: next,
          selectedCell: null,
          turnCount: state.turnCount + 1,
          message: `Wrong! ${markSymbol(next)}'s turn`,
        };
      }

      if (state.used.includes(found.id)) {
        return {
          ...state,
          turn: next,
          selectedCell: null,
          turnCount: state.turnCount + 1,
          message: `Already used ${found.name}! ${markSymbol(next)}'s turn`,
        };
      }

      const r = Math.floor(state.selectedCell / 3);
      const c = state.selectedCell % 3;
      const fits =
        found.traits.includes(state.rows[r]) &&
        found.traits.includes(state.cols[c]);

      if (!fits) {
        return {
          ...state,
          turn: next,
          selectedCell: null,
          turnCount: state.turnCount + 1,
          message: `Wrong! ${markSymbol(next)}'s turn`,
        };
      }

      const nextCells = [...state.cells];
      nextCells[state.selectedCell] = {
        animalId: found.id,
        mark: state.turn,
      };
      const nextUsed = [...state.used, found.id];
      const winCheck = findWinner(nextCells);

      if (winCheck) {
        return {
          ...state,
          cells: nextCells,
          used: nextUsed,
          selectedCell: null,
          winner: winCheck.winner,
          winningLine: winCheck.line,
          turnCount: state.turnCount + 1,
          message: `Player ${markSymbol(winCheck.winner)} wins with 3 in a row! 🎉`,
        };
      }

      if (nextCells.every((cell) => cell !== null)) {
        return {
          ...state,
          cells: nextCells,
          used: nextUsed,
          selectedCell: null,
          winner: "draw",
          winningLine: null,
          turnCount: state.turnCount + 1,
          message: "Full board — it's a draw! 🤝",
        };
      }

      return {
        ...state,
        cells: nextCells,
        used: nextUsed,
        turn: next,
        selectedCell: null,
        turnCount: state.turnCount + 1,
        message: `${found.name} claimed by ${markSymbol(state.turn)}! ${markSymbol(next)}'s turn`,
      };
    }

    default:
      return state;
  }
}

