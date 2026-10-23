import { createRng, pick } from "@/lib/rng";

export type LossBracket = "11" | "9-10" | "6-8" | "3-5" | "1-2" | "0";

export const ZERO_MISTAKES_MESSAGE =
  "Zero wrong clicks. Linnaeus is shaking.";

/**
 * Loss message pools per bracket (Step 16).
 * Includes:
 * 1. Shipped messages (verbatim)
 * 2. Original notes messages (verbatim)
 * 3. Extra lines in the BioGames voice (flagged in report for review)
 */
export const LOSS_MESSAGE_POOLS: Readonly<
  Record<LossBracket, readonly string[]>
> = {
  "11": [
    'ikr, that one "{cat}" you probably skimmed through or just didn\'t wanna show up',
    "AAA ikr, that one {cat} you probably skimmed through or just didn't wanna show up",
    '11/12... "{cat}" really saw your streak and chose violence',
  ],
  "9-10": [
    "You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand",
    "You came quite close, even I couldn't do all 12 cells at first, and I literally made this game by hand",
    "{n}/12 is lowkey respectable, Darwin would still let you on the Beagle",
  ],
  "6-8": [
    "{n} cells... not great, not terrible",
    "{n} Roentgen, not great, not terrible",
    "{n}/12, perfectly balanced, as half a biology textbook should be",
  ],
  "3-5": [
    "{n} out of 12, tough luck I guess, im sure it's just a warm up gamr tho",
    "Warm Up game fr, I'm sure you'll do better next time",
    "{n}/12, the taxonomy tree shook and you fell out of it",
  ],
  "1-2": [
    "{n}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet",
    "vayan a estudiar",
    "{n}/12, bro guessed on vibes and the vibes were paraphyletic",
  ],
  "0": [
    "0 out of 12, vayan a estudiar",
    "dont even blame the RNG, just put the fries in the bag lil bro",
    "0/12, did you play with the monitor turned off or what",
  ],
};

export function getLossBracket(filledCount: number): LossBracket {
  if (filledCount >= 11) return "11";
  if (filledCount >= 9) return "9-10";
  if (filledCount >= 6) return "6-8";
  if (filledCount >= 3) return "3-5";
  if (filledCount >= 1) return "1-2";
  return "0";
}

function formatLossTemplate(
  template: string,
  filledCount: number,
  unfilledCategoryLabel?: string
): string {
  return template
    .replaceAll("{cat}", unfilledCategoryLabel ?? "category")
    .replaceAll("{n}", String(filledCount));
}

/**
 * Deterministic loss message picker from the bracket's pool.
 * In hard mode, excludes lines mentioning the Cheat Sheet (since it is disabled).
 */
export function pickLossMessage(
  filledCount: number,
  unfilledCategoryLabel: string | undefined,
  hardMode: boolean,
  seed: number | string
): string {
  const bracket = getLossBracket(filledCount);
  const rawPool = LOSS_MESSAGE_POOLS[bracket];
  const filteredPool = hardMode
    ? rawPool.filter((line) => !line.toLowerCase().includes("cheat sheet"))
    : rawPool;
  const pool = filteredPool.length > 0 ? filteredPool : rawPool;
  const chosen = pick(pool, createRng(seed));
  return formatLossTemplate(chosen, filledCount, unfilledCategoryLabel);
}

/**
 * Legacy deterministic loss message helper (returns the first shipped line for the bracket).
 */
export function getLossMessage(
  filledCount: number,
  unfilledCategoryLabel?: string
): string {
  const bracket = getLossBracket(filledCount);
  const template = LOSS_MESSAGE_POOLS[bracket][0]!;
  return formatLossTemplate(template, filledCount, unfilledCategoryLabel);
}

/**
 * Exact follow-up message from original GameOver.tsx:56-75.
 */
export function getFollowUpMessage(won: boolean, hardMode: boolean): string {
  if (won) {
    return hardMode
      ? "And you even beat it on Hard Mode! You, are the greatest biological mind I've ever known."
      : "Try Hard Mode if you're up for a bigger challenge";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}
