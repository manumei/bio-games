import type { TaxonId } from "@/data/taxonomy";
import type { TimerOption } from "@/games/taxo-bingo/config";
import type { TaxoDailyState } from "@/games/taxo-bingo/logic/daily";
import type { Rng } from "@/lib/rng";

export type GamePhase = "menu" | "playing" | "over";
export type GameMode = "daily" | "practice";
export type EndReason = "won" | "timeout" | "gave-up";

export interface TaxoGameOptions {
  timer: TimerOption;
  hardMode: boolean;
}

export interface DeckState {
  ids: readonly string[];
  cursor: number;
}

export interface MisplacedCellState {
  taxonId: TaxonId;
  nonce: number;
}

export interface TaxoGameState {
  mode: GameMode;
  dayKey: string | null;
  seed: number;
  phase: GamePhase;
  options: TaxoGameOptions;
  grid: TaxonId[];
  filled: Record<TaxonId, string>;
  mistakes: number;
  skips: number;
  deck: DeckState;
  isImageReady: boolean;
  startedAt: number | null;
  deadline: number | null;
  endedAt: number | null;
  endReason: EndReason | null;
  modalOpen: boolean;
  misplacedCell: MisplacedCellState | null;
  dailyFinishedForToday: boolean;
}

export type TaxoAction =
  | { type: "SET_OPTIONS"; timer?: TimerOption; hardMode?: boolean }
  | {
      type: "START";
      rng: Rng;
      mode?: GameMode;
      dayKey?: string | null;
      seed?: number;
      now?: number;
      gridIds?: TaxonId[];
      organismIds?: readonly string[];
    }
  | {
      type: "HYDRATE_DAILY";
      dailyState: TaxoDailyState;
      rng: Rng;
      seed: number;
    }
  | { type: "NEXT_READY"; now: number }
  | { type: "PLACE"; taxonId: TaxonId; rng: Rng; now?: number }
  | { type: "MISPLACE"; taxonId: TaxonId }
  | { type: "CLEAR_MISPLACE" }
  | { type: "SKIP"; rng: Rng; force?: boolean }
  | { type: "TICK_EXPIRED"; now?: number }
  | { type: "GIVE_UP"; now?: number }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_MODAL" };
