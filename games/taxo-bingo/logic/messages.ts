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
    '11 out of 12 categories completed. Just missed the final "{cat}".',
    '11/12 categories matched. A very close taxonomic identification.',
    '11 out of 12 cells identified. Review {cat} and try again.',
  ],
  "9-10": [
    "{n} out of 12 categories identified. Solid taxonomic classification.",
    "{n}/12 categories matched. Good attempt at completing the tree of life.",
    "Well played: {n} out of 12 categories correctly identified.",
  ],
  "6-8": [
    "{n} out of 12 categories identified. Halfway through the grid.",
    "{n}/12 categories matched. Keep practicing taxonomic relationships.",
    "{n} categories completed. Review organism classifications to improve your score.",
  ],
  "3-5": [
    "{n} out of 12 categories matched. Review the taxonomy tree and try another round.",
    "{n}/12 categories completed. Practice identifying traits across different kingdoms.",
    "{n} categories identified. Better luck on the next attempt.",
  ],
  "1-2": [
    "{n} out of 12 categories matched. Review the taxonomic categories and try again.",
    "{n}/12 categories identified. Check the classification guide to strengthen your recall.",
    "{n} category matched. Study the taxonomy tree and attempt another round.",
  ],
  "0": [
    "0 out of 12 categories matched. Review the taxonomic groups and try again.",
    "Game over. No categories matched this round. Try another attempt to practice.",
    "0/12 categories matched. Familiarize yourself with the taxonomy tree and give it another try.",
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
