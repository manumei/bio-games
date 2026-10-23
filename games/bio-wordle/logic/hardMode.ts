import type { TileEval } from "@/games/bio-wordle/types";

function ordinal(pos1Based: number): string {
  if (pos1Based === 1) return "1st";
  if (pos1Based === 2) return "2nd";
  if (pos1Based === 3) return "3rd";
  return `${pos1Based}th`;
}

/**
 * NYT-style Hard Mode validation:
 * 1. Every `correct` letter from previous guesses must stay in its exact position -> "4th letter must be E".
 * 2. Every `present`/`correct` letter must appear at least the max count revealed in any single previous guess -> "Guess must contain L" or "Guess must contain 2 L's".
 */
export function checkHardMode(
  guess: string,
  previousGuesses: readonly string[],
  previousResults: readonly (readonly TileEval[])[]
): string | null {
  const normalizedGuess = guess.toLowerCase();
  const len = normalizedGuess.length;

  const requiredAtPos: (string | null)[] = new Array<string | null>(len).fill(
    null
  );
  const requiredMinCounts: Record<string, number> = {};

  for (let gIdx = 0; gIdx < previousGuesses.length; gIdx++) {
    const prevGuess = previousGuesses[gIdx]!.toLowerCase();
    const prevResult = previousResults[gIdx];
    if (!prevResult) continue;

    const countsInThisGuess: Record<string, number> = {};
    for (let i = 0; i < prevGuess.length; i++) {
      const ch = prevGuess[i]!;
      const state = prevResult[i];
      if (state === "correct") {
        requiredAtPos[i] = ch;
        countsInThisGuess[ch] = (countsInThisGuess[ch] ?? 0) + 1;
      } else if (state === "present") {
        countsInThisGuess[ch] = (countsInThisGuess[ch] ?? 0) + 1;
      }
    }

    for (const [ch, count] of Object.entries(countsInThisGuess)) {
      if (count > (requiredMinCounts[ch] ?? 0)) {
        requiredMinCounts[ch] = count;
      }
    }
  }

  for (let i = 0; i < len; i++) {
    const req = requiredAtPos[i];
    if (req && normalizedGuess[i] !== req) {
      return `${ordinal(i + 1)} letter must be ${req.toUpperCase()}`;
    }
  }

  const guessCounts: Record<string, number> = {};
  for (const ch of normalizedGuess) {
    guessCounts[ch] = (guessCounts[ch] ?? 0) + 1;
  }

  for (const [ch, minCount] of Object.entries(requiredMinCounts)) {
    const actual = guessCounts[ch] ?? 0;
    if (actual < minCount) {
      if (minCount === 1) {
        return `Guess must contain ${ch.toUpperCase()}`;
      }
      return `Guess must contain ${minCount} ${ch.toUpperCase()}'s`;
    }
  }

  return null;
}
