import { MAX_GUESSES } from "@/games/bio-wordle/config";
import type { WordleDailyState } from "@/games/bio-wordle/logic/daily";
import { scoreGuess } from "@/games/bio-wordle/logic/score";
import { puzzleNumber } from "@/lib/daily";
import { SITE_CONFIG } from "@/lib/site";

export interface WordleShareOptions {
  dayNumber?: number;
  url?: string;
}

const TILE_EMOJI = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
} as const;

/**
 * Build spoiler-free share text for Bio Wordle matching the Step 6 format.
 */
export function buildShareText(
  state: WordleDailyState,
  opts?: WordleShareOptions
): string {
  const num = opts?.dayNumber ?? puzzleNumber(state.dayKey);
  const url = opts?.url ?? `${SITE_CONFIG.url}/bio-wordle`;
  const scoreStr =
    state.status === "won"
      ? `${state.guesses.length}/${MAX_GUESSES}`
      : `X/${MAX_GUESSES}`;
  const len = state.answer.length;

  let header = `Bio Wordle #${num} ${scoreStr} · ${len} letters`;
  if (state.options.hardMode) {
    header += " 💀 Hard";
  }
  if (state.hintUsed) {
    header += " 💡";
  }

  const gridLines = state.guesses.map((guess) =>
    scoreGuess(guess, state.answer)
      .map((cell) => TILE_EMOJI[cell])
      .join("")
  );

  return [header, ...gridLines, url].join("\n");
}

