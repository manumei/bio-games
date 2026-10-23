import { createRng, pick } from "@/lib/rng";

export const THINKING_LINES: readonly string[] = [
  "Hmm…",
  "Interesting…",
  "Ah, a classic.",
  "Let me consult my notes…",
  "Checking the 10th edition of Systema Naturae…",
];

export const WRONG_GUESS_LINES: readonly string[] = [
  "Impossible. Did that organism evolve in the last five minutes?",
  "Fine. FINE. Next question.",
  "A minor taxonomic hiccup.",
  "Fascinating anomaly. Let us recalibrate the genus.",
];

export const LINNAEUS_WIN_LINES: readonly string[] = [
  "Of course. I literally invented binomial nomenclature.",
  "Classified. Next.",
  "Taxonomy strikes again. Nature has no secrets from Carl Linnaeus.",
];

export const PLAYER_WIN_LINES: readonly string[] = [
  "You've stumped me. I'll add it to the next edition of Systema Naturae.",
  "Well played. Even I didn't see that one evolving.",
  "An undescribed taxon? Outstanding fieldwork, my friend.",
];

export function pickThinkingLine(seed: number | string): string {
  return pick(THINKING_LINES, createRng(`${seed}:think`));
}

export function pickWrongGuessLine(seed: number | string): string {
  return pick(WRONG_GUESS_LINES, createRng(`${seed}:wrong`));
}

export function pickLinnaeusWinLine(seed: number | string): string {
  return pick(LINNAEUS_WIN_LINES, createRng(`${seed}:l_win`));
}

export function pickPlayerWinLine(seed: number | string): string {
  return pick(PLAYER_WIN_LINES, createRng(`${seed}:p_win`));
}

