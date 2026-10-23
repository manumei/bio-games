import type { TaxonId } from "@/data/taxonomy";
import type { TimerOption } from "@/games/taxo-bingo/config";
import type { Rng } from "@/lib/rng";

export type GamePhase = "menu" | "playing" | "over";
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
  phase: GamePhase;
  options: TaxoGameOptions;
  grid: TaxonId[];
  filled: Record<TaxonId, string>;
  deck: DeckState;
  isImageReady: boolean;
  deadline: number | null;
  endReason: EndReason | null;
  modalOpen: boolean;
  misplacedCell: MisplacedCellState | null;
}

export type TaxoAction =
  | { type: "SET_OPTIONS"; timer?: TimerOption; hardMode?: boolean }
  | { type: "START"; rng: Rng; organismIds?: readonly string[] }
  | { type: "NEXT_READY"; now: number }
  | { type: "PLACE"; taxonId: TaxonId; rng: Rng }
  | { type: "MISPLACE"; taxonId: TaxonId }
  | { type: "CLEAR_MISPLACE" }
  | { type: "SKIP"; rng: Rng; force?: boolean }
  | { type: "TICK_EXPIRED" }
  | { type: "GIVE_UP" }
  | { type: "CLOSE_MODAL" };
