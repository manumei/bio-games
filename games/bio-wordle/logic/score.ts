import type { TileEval } from "@/games/bio-wordle/types";

const STATE_RANK: Readonly<Record<TileEval, number>> = {
  absent: 1,
  present: 2,
  correct: 3,
};

/**
 * Standard two-pass count-aware Wordle evaluation algorithm.
 */
export function scoreGuess(guess: string, answer: string): TileEval[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const len = a.length;
  const result: TileEval[] = new Array<TileEval>(len).fill("absent");
  const remainingCounts: Record<string, number> = {};

  // Pass 1: mark exact matches and count remaining unmatched answer letters
  for (let i = 0; i < len; i++) {
    const gChar = g[i]!;
    const aChar = a[i]!;
    if (gChar === aChar) {
      result[i] = "correct";
    } else {
      remainingCounts[aChar] = (remainingCounts[aChar] ?? 0) + 1;
    }
  }

  // Pass 2: left to right, mark present when remaining count > 0
  for (let i = 0; i < len; i++) {
    if (result[i] === "correct") continue;
    const gChar = g[i]!;
    const available = remainingCounts[gChar] ?? 0;
    if (available > 0) {
      result[i] = "present";
      remainingCounts[gChar] = available - 1;
    }
  }

  return result;
}

/**
 * Merge a guess and its evaluation into the keyboard state map,
 * where a key's state only upgrades (absent < present < correct).
 */
export function mergeKeyStates(
  prev: Readonly<Record<string, TileEval>>,
  guess: string,
  result: readonly TileEval[]
): Record<string, TileEval> {
  const next: Record<string, TileEval> = { ...prev };
  const lower = guess.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i]!;
    const evalState = result[i]!;
    const current = next[ch];
    if (!current || STATE_RANK[evalState] > STATE_RANK[current]) {
      next[ch] = evalState;
    }
  }
  return next;
}
