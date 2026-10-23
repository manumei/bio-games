import { ORGANISMS, getOrganism } from "@/data/organisms";
import {
  DEFAULT_TIMER,
  GRID_SIZE,
  resolveTimerForHardMode,
} from "@/games/taxo-bingo/config";
import {
  createDeck,
  currentOrganismId,
  removeCurrent,
  skipCurrent,
} from "@/games/taxo-bingo/logic/deck";
import { generateGrid } from "@/games/taxo-bingo/logic/grid";
import type { TaxoAction, TaxoGameState } from "@/games/taxo-bingo/types";

const DEFAULT_ORGANISM_IDS: readonly string[] = ORGANISMS.map((o) => o.id);

export function createInitialTaxoState(): TaxoGameState {
  return {
    phase: "menu",
    options: {
      timer: DEFAULT_TIMER,
      hardMode: false,
    },
    grid: [],
    filled: {},
    deck: { ids: [], cursor: 0 },
    isImageReady: false,
    deadline: null,
    endReason: null,
    modalOpen: false,
    misplacedCell: null,
  };
}

export function taxoReducer(
  state: TaxoGameState,
  action: TaxoAction
): TaxoGameState {
  switch (action.type) {
    case "SET_OPTIONS": {
      const nextHard = action.hardMode ?? state.options.hardMode;
      const requestedTimer =
        action.timer !== undefined ? action.timer : state.options.timer;
      const nextTimer = resolveTimerForHardMode(requestedTimer, nextHard);
      return {
        ...state,
        options: {
          timer: nextTimer,
          hardMode: nextHard,
        },
      };
    }

    case "START": {
      const poolIds = action.organismIds ?? DEFAULT_ORGANISM_IDS;
      const grid = generateGrid(action.rng);
      const deck = createDeck(poolIds, action.rng);
      return {
        ...state,
        phase: "playing",
        grid,
        filled: {},
        deck,
        isImageReady: false,
        deadline: null,
        endReason: null,
        modalOpen: false,
        misplacedCell: null,
      };
    }

    case "NEXT_READY": {
      if (state.phase !== "playing") return state;
      const nextDeadline =
        state.deadline === null && state.options.timer !== null
          ? action.now + state.options.timer * 1000
          : state.deadline;
      return {
        ...state,
        isImageReady: true,
        deadline: nextDeadline,
      };
    }

    case "MISPLACE": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        misplacedCell: {
          taxonId: action.taxonId,
          nonce: (state.misplacedCell?.nonce ?? 0) + 1,
        },
      };
    }

    case "CLEAR_MISPLACE": {
      if (!state.misplacedCell) return state;
      return {
        ...state,
        misplacedCell: null,
      };
    }

    case "PLACE": {
      if (state.phase !== "playing" || !state.isImageReady) return state;
      if (state.filled[action.taxonId]) return state;

      const currentId = currentOrganismId(state.deck);
      if (!currentId) return state;

      const organism = getOrganism(currentId);
      const matches = organism.path.includes(action.taxonId);

      if (!matches) {
        return {
          ...state,
          misplacedCell: {
            taxonId: action.taxonId,
            nonce: (state.misplacedCell?.nonce ?? 0) + 1,
          },
        };
      }

      const nextFilled = {
        ...state.filled,
        [action.taxonId]: currentId,
      };

      if (Object.keys(nextFilled).length >= GRID_SIZE) {
        return {
          ...state,
          filled: nextFilled,
          phase: "over",
          endReason: "won",
          modalOpen: true,
          deadline: null,
          misplacedCell: null,
        };
      }

      return {
        ...state,
        filled: nextFilled,
        deck: removeCurrent(state.deck, action.rng),
        isImageReady: false,
        misplacedCell: null,
      };
    }

    case "SKIP": {
      if (state.phase !== "playing") return state;
      if (!state.isImageReady && !action.force) return state;
      return {
        ...state,
        deck: skipCurrent(state.deck, action.rng),
        isImageReady: false,
      };
    }

    case "TICK_EXPIRED": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "over",
        endReason: "timeout",
        modalOpen: true,
        deadline: null,
      };
    }

    case "GIVE_UP": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "over",
        endReason: "gave-up",
        modalOpen: true,
        deadline: null,
      };
    }

    case "CLOSE_MODAL": {
      return {
        ...state,
        modalOpen: false,
      };
    }
  }
}
