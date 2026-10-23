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
    mode: "daily",
    dayKey: null,
    seed: 1,
    phase: "menu",
    options: {
      timer: DEFAULT_TIMER,
      hardMode: false,
    },
    grid: [],
    filled: {},
    mistakes: 0,
    skips: 0,
    deck: { ids: [], cursor: 0 },
    isImageReady: false,
    startedAt: null,
    deadline: null,
    endedAt: null,
    endReason: null,
    modalOpen: false,
    misplacedCell: null,
    dailyFinishedForToday: false,
  };
}

export function taxoReducer(
  state: TaxoGameState,
  action: TaxoAction
): TaxoGameState {
  switch (action.type) {
    case "RESET_TO_MENU": {
      return {
        ...createInitialTaxoState(),
        options: state.options,
      };
    }
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
      const grid = action.gridIds ?? generateGrid(action.rng);
      const deck = createDeck(poolIds, action.rng);
      const mode = action.mode ?? "daily";
      const now = action.now ?? null;
      return {
        ...state,
        mode,
        dayKey: mode === "daily" ? (action.dayKey ?? state.dayKey) : null,
        seed: action.seed ?? state.seed,
        phase: "playing",
        grid,
        filled: {},
        mistakes: 0,
        skips: 0,
        deck,
        isImageReady: false,
        startedAt: now,
        deadline: null,
        endedAt: null,
        endReason: null,
        modalOpen: false,
        misplacedCell: null,
      };
    }

    case "HYDRATE_DAILY": {
      const { dailyState, rng, seed } = action;
      const placedOrgIds = new Set(Object.values(dailyState.placements));
      const remainingIds = DEFAULT_ORGANISM_IDS.filter(
        (id) => !placedOrgIds.has(id)
      );
      const deck = createDeck(remainingIds, rng);

      if (dailyState.status === "playing") {
        return {
          ...state,
          mode: "daily",
          dayKey: dailyState.dayKey,
          seed,
          phase: "playing",
          options: dailyState.options,
          grid: dailyState.gridIds,
          filled: dailyState.placements,
          mistakes: dailyState.mistakes,
          skips: dailyState.skips,
          deck,
          isImageReady: false,
          startedAt: dailyState.startedAt,
          deadline: dailyState.deadline,
          endedAt: null,
          endReason: null,
          modalOpen: false,
          misplacedCell: null,
          dailyFinishedForToday: false,
        };
      }

      const endReason =
        dailyState.status === "won"
          ? "won"
          : dailyState.endReason === "gave-up"
          ? "gave-up"
          : "timeout";

      return {
        ...state,
        mode: "daily",
        dayKey: dailyState.dayKey,
        seed,
        phase: "over",
        options: dailyState.options,
        grid: dailyState.gridIds,
        filled: dailyState.placements,
        mistakes: dailyState.mistakes,
        skips: dailyState.skips,
        deck,
        isImageReady: false,
        startedAt: dailyState.startedAt,
        deadline: dailyState.deadline,
        endedAt: dailyState.endedAt,
        endReason,
        modalOpen: true,
        misplacedCell: null,
        dailyFinishedForToday: true,
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
        startedAt: state.startedAt ?? action.now,
        deadline: nextDeadline,
      };
    }

    case "MISPLACE": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        mistakes: state.mistakes + 1,
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
          mistakes: state.mistakes + 1,
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
          endedAt: action.now ?? Date.now(),
          modalOpen: true,
          misplacedCell: null,
          dailyFinishedForToday:
            state.mode === "daily" ? true : state.dailyFinishedForToday,
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
        skips: action.force ? state.skips : state.skips + 1,
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
        endedAt: state.deadline ?? action.now ?? Date.now(),
        modalOpen: true,
        dailyFinishedForToday:
          state.mode === "daily" ? true : state.dailyFinishedForToday,
      };
    }

    case "GIVE_UP": {
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "over",
        endReason: "gave-up",
        endedAt: action.now ?? Date.now(),
        modalOpen: true,
        dailyFinishedForToday:
          state.mode === "daily" ? true : state.dailyFinishedForToday,
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
