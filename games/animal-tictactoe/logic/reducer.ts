import { createRng } from "@/lib/rng";
import { findExact } from "@/lib/text";
import { GRID_CELL_COUNT, HARD_GUESSES, NORMAL_GUESSES } from "../config";
import {
  ANIMALS,
  getAnimal,
  toSearchableAnimals,
  type Animal,
} from "../data/animals";
import { TRAITS } from "../data/traits";
import type { TicTacOptions, TicTacState } from "../types";
import { generateGrid } from "./grid";
import { getTicTacFollowUpMessage, pickTicTacEndMessage } from "./messages";

export type TicTacAction =
  | {
      type: "START_GAME";
      options?: Partial<TicTacOptions>;
      seed: number;
      rows?: [string, string, string];
      cols?: [string, string, string];
    }
  | { type: "SET_OPTIONS"; options: Partial<TicTacOptions> }
  | { type: "SUBMIT_GUESS"; text: string; animals?: readonly Animal[] }
  | { type: "PICK_CELL"; cellIndex: number }
  | { type: "CANCEL_PICK" }
  | { type: "GIVE_UP" }
  | { type: "BACK_TO_MENU" }
  | { type: "HYDRATE_STATE"; state: TicTacState };

export const DEFAULT_OPTIONS: TicTacOptions = {
  hardMode: false,
  daily: false,
  versus: false,
  versusTimer: false,
};

export function createInitialState(
  partialOptions?: Partial<TicTacOptions>,
): TicTacState {
  const options: TicTacOptions = { ...DEFAULT_OPTIONS, ...partialOptions };
  const budget = options.hardMode ? HARD_GUESSES : NORMAL_GUESSES;
  return {
    phase: "menu",
    options,
    seed: 1,
    rows: ["mammal", "bird", "reptile"],
    cols: ["carnivorous", "herbivore", "africa"],
    cells: Array<string | null>(GRID_CELL_COUNT).fill(null),
    guessesLeft: budget,
    guessesUsed: 0,
    used: [],
    pending: null,
    message: null,
    outcome: null,
    endMessage: null,
    hardModeNotice: null,
  };
}

function findMatchingEmptyCells(
  animal: Animal,
  rows: readonly [string, string, string],
  cols: readonly [string, string, string],
  cells: readonly (string | null)[],
): number[] {
  const indices: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      if (cells[idx] !== null) continue;
      if (
        animal.traits.includes(rows[r]) &&
        animal.traits.includes(cols[c])
      ) {
        indices.push(idx);
      }
    }
  }
  return indices;
}

function finalizeTurn(
  state: TicTacState,
  nextCells: (string | null)[],
  nextUsed: string[],
  nextGuessesLeft: number,
  nextGuessesUsed: number,
  nextMessage: string,
): TicTacState {
  const filledCount = nextCells.filter((c) => c !== null).length;
  if (filledCount === GRID_CELL_COUNT) {
    return {
      ...state,
      phase: "over",
      cells: nextCells,
      used: nextUsed,
      guessesLeft: nextGuessesLeft,
      guessesUsed: nextGuessesUsed,
      pending: null,
      message: nextMessage,
      outcome: "completed",
      endMessage: pickTicTacEndMessage(
        true,
        filledCount,
        nextGuessesUsed,
        state.seed,
      ),
      hardModeNotice: getTicTacFollowUpMessage(true, state.options.hardMode),
    };
  }

  if (nextGuessesLeft <= 0) {
    return {
      ...state,
      phase: "over",
      cells: nextCells,
      used: nextUsed,
      guessesLeft: 0,
      guessesUsed: nextGuessesUsed,
      pending: null,
      message: nextMessage,
      outcome: "failed",
      endMessage: pickTicTacEndMessage(
        false,
        filledCount,
        nextGuessesUsed,
        state.seed,
      ),
      hardModeNotice: getTicTacFollowUpMessage(false, state.options.hardMode),
    };
  }

  return {
    ...state,
    cells: nextCells,
    used: nextUsed,
    guessesLeft: nextGuessesLeft,
    guessesUsed: nextGuessesUsed,
    pending: null,
    message: nextMessage,
  };
}

export function ticTacReducer(
  state: TicTacState,
  action: TicTacAction,
): TicTacState {
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

    case "BACK_TO_MENU": {
      return createInitialState(state.options);
    }

    case "START_GAME": {
      const options: TicTacOptions = {
        ...state.options,
        ...action.options,
      };
      if (options.versus) {
        const grid =
          action.rows && action.cols
            ? { rows: action.rows, cols: action.cols }
            : generateGrid(createRng(action.seed), ANIMALS, TRAITS);
        return {
          ...createInitialState(options),
          phase: "versus",
          seed: action.seed,
          rows: grid.rows,
          cols: grid.cols,
        };
      }
      const grid =
        action.rows && action.cols
          ? { rows: action.rows, cols: action.cols }
          : generateGrid(createRng(action.seed), ANIMALS, TRAITS);
      const budget = options.hardMode ? HARD_GUESSES : NORMAL_GUESSES;
      return {
        phase: "playing",
        options,
        seed: action.seed,
        rows: grid.rows,
        cols: grid.cols,
        cells: Array<string | null>(GRID_CELL_COUNT).fill(null),
        guessesLeft: budget,
        guessesUsed: 0,
        used: [],
        pending: null,
        message: null,
        outcome: null,
        endMessage: null,
        hardModeNotice: null,
      };
    }

    case "SUBMIT_GUESS": {
      if (state.phase !== "playing" || state.pending !== null) {
        return state;
      }
      const trimmed = action.text.trim();
      if (!trimmed) return state;

      const pool = action.animals
        ? toSearchableAnimals(action.animals)
        : ANIMALS;
      const found = findExact(pool, trimmed);
      if (!found) {
        return {
          ...state,
          message: `${trimmed} isn't in our animal list`,
        };
      }

      if (state.options.hardMode && state.used.includes(found.id)) {
        return {
          ...state,
          message: `Already used ${found.name}`,
        };
      }

      const emptyMatches = findMatchingEmptyCells(
        found,
        state.rows,
        state.cols,
        state.cells,
      );

      if (emptyMatches.length === 0) {
        const nextUsed = state.used.includes(found.id)
          ? state.used
          : [...state.used, found.id];
        return finalizeTurn(
          state,
          state.cells,
          nextUsed,
          state.guessesLeft - 1,
          state.guessesUsed + 1,
          `${found.name} does not fit the grid`,
        );
      }

      if (emptyMatches.length === 1) {
        const idx = emptyMatches[0];
        const nextCells = [...state.cells];
        nextCells[idx] = found.id;
        const nextUsed = state.used.includes(found.id)
          ? state.used
          : [...state.used, found.id];
        return finalizeTurn(
          state,
          nextCells,
          nextUsed,
          state.guessesLeft - 1,
          state.guessesUsed + 1,
          `${found.name} has been added!`,
        );
      }

      return {
        ...state,
        pending: {
          animalId: found.id,
          candidateCells: emptyMatches,
        },
        message: `${found.name} fits ${emptyMatches.length} cells, click one to place it`,
      };
    }

    case "PICK_CELL": {
      if (state.phase !== "playing" || !state.pending) return state;
      if (!state.pending.candidateCells.includes(action.cellIndex)) {
        return state;
      }
      const animal = getAnimal(state.pending.animalId);
      const nextCells = [...state.cells];
      nextCells[action.cellIndex] = animal.id;
      const nextUsed = state.used.includes(animal.id)
        ? state.used
        : [...state.used, animal.id];
      return finalizeTurn(
        state,
        nextCells,
        nextUsed,
        state.guessesLeft - 1,
        state.guessesUsed + 1,
        `${animal.name} has been added!`,
      );
    }

    case "CANCEL_PICK": {
      if (state.phase !== "playing" || !state.pending) return state;
      return {
        ...state,
        pending: null,
        message: null,
      };
    }

    case "GIVE_UP": {
      if (state.phase !== "playing") return state;
      const filledCount = state.cells.filter((c) => c !== null).length;
      return {
        ...state,
        phase: "over",
        pending: null,
        outcome: "gave-up",
        endMessage: pickTicTacEndMessage(
          false,
          filledCount,
          state.guessesUsed,
          state.seed,
        ),
        hardModeNotice: getTicTacFollowUpMessage(false, state.options.hardMode),
      };
    }

    default:
      return state;
  }
}

