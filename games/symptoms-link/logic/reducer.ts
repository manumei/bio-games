import { MAX_STAGE } from "@/games/symptoms-link/config";
import { DISEASES, type Disease } from "@/games/symptoms-link/data/diseases";
import { LUPUS_WRONG_TOAST } from "@/games/symptoms-link/logic/messages";
import type { LinkAction, LinkGameState } from "@/games/symptoms-link/types";
import { findExact } from "@/lib/text";

export function createInitialLinkState(): LinkGameState {
  return {
    mode: "daily",
    dayKey: null,
    seed: 1,
    phase: "menu",
    options: { hardMode: false },
    disease: DISEASES[0]!,
    stage: 1,
    log: [],
    won: false,
    endedAt: null,
    modalOpen: false,
    dailyFinishedForToday: false,
  };
}

export type GuessEvaluation =
  | { status: "unknown"; toast: string }
  | { status: "duplicate"; toast: string }
  | { status: "accepted"; disease: Disease; toast: string | null };

/**
 * Evaluate a user guess before dispatching GUESS to the reducer.
 * - Unknown disease -> "Not in our disease list" (no penalty)
 * - Already tried -> "Already tried that one" (no penalty)
 * - Wrong guess of Lupus -> "It's never lupus."
 * - Other wrong guess (at stage < 5) -> "Incorrect"
 */
export function evaluateDiseaseSubmission(
  state: LinkGameState,
  pickedItemId: string | null,
  rawText: string,
  allDiseases: readonly Disease[] = DISEASES
): GuessEvaluation {
  const searchable = allDiseases.map((d) => ({
    id: d.id,
    label: d.name,
    aliases: d.aliases,
    disease: d,
  }));

  const matched =
    (pickedItemId
      ? searchable.find((s) => s.id === pickedItemId) ?? null
      : null) ?? findExact(searchable, rawText);

  if (!matched) {
    return { status: "unknown", toast: "Not in our disease list" };
  }

  const alreadyTried = state.log.some(
    (entry) => entry.kind === "wrong" && entry.diseaseId === matched.id
  );
  if (alreadyTried) {
    return { status: "duplicate", toast: "Already tried that one" };
  }

  if (matched.id === state.disease.id) {
    return { status: "accepted", disease: matched.disease, toast: null };
  }

  if (matched.id === "lupus") {
    return {
      status: "accepted",
      disease: matched.disease,
      toast: LUPUS_WRONG_TOAST,
    };
  }

  return {
    status: "accepted",
    disease: matched.disease,
    toast: state.stage < MAX_STAGE ? "Incorrect" : null,
  };
}

export function linkReducer(
  state: LinkGameState,
  action: LinkAction
): LinkGameState {
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
        disease: action.disease,
        stage: 1,
        log: [],
        won: false,
        endedAt: null,
        modalOpen: false,
      };
    }

    case "HYDRATE_DAILY": {
      const { dailyState, disease, seed } = action;
      const isOver = dailyState.status !== "playing";
      const won = dailyState.status === "won";
      return {
        ...state,
        mode: "daily",
        dayKey: dailyState.dayKey,
        seed,
        phase: isOver ? "over" : "playing",
        options: dailyState.options,
        disease,
        stage: dailyState.stage,
        log: dailyState.log,
        won,
        endedAt: dailyState.endedAt,
        modalOpen: isOver,
        dailyFinishedForToday: isOver,
      };
    }

    case "GUESS": {
      if (state.phase !== "playing") return state;

      // Ignore duplicate wrong guesses defensively
      if (
        state.log.some(
          (entry) =>
            entry.kind === "wrong" && entry.diseaseId === action.diseaseId
        )
      ) {
        return state;
      }

      if (action.diseaseId === state.disease.id) {
        return {
          ...state,
          phase: "over",
          won: true,
          endedAt: action.now,
          modalOpen: true,
          dailyFinishedForToday:
            state.mode === "daily" ? true : state.dailyFinishedForToday,
        };
      }

      const nextLog = [
        ...state.log,
        { kind: "wrong" as const, diseaseId: action.diseaseId },
      ];

      if (state.stage >= MAX_STAGE) {
        return {
          ...state,
          log: nextLog,
          phase: "over",
          won: false,
          endedAt: action.now,
          modalOpen: true,
          dailyFinishedForToday:
            state.mode === "daily" ? true : state.dailyFinishedForToday,
        };
      }

      return {
        ...state,
        stage: state.stage + 1,
        log: nextLog,
      };
    }

    case "SKIP": {
      if (state.phase !== "playing") return state;
      if (state.stage >= MAX_STAGE) return state;
      return {
        ...state,
        stage: state.stage + 1,
        log: [...state.log, { kind: "skip" }],
      };
    }

    case "GIVE_UP": {
      if (state.phase !== "playing") return state;
      const paddedLog = [...state.log];
      while (paddedLog.length < MAX_STAGE) {
        paddedLog.push({ kind: "skip" });
      }
      return {
        ...state,
        stage: MAX_STAGE,
        log: paddedLog,
        phase: "over",
        won: false,
        endedAt: action.now,
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
