import { createRng, pick } from "@/lib/rng";

export const HARD_MODE_HINT_TOOLTIP =
  "Hints? In Hard Mode? Bold of you to assume.";

export const WIN_MESSAGES_BY_GUESS: Readonly<Record<number, readonly string[]>> = {
  1: [
    "First try?? Either you're a genius or you read the source code 👀",
    "1/6. Bro is literally a sentient Campbell Biology textbook.",
  ],
  2: [
    "Two guesses. Darwin would've taken notes.",
    "Solved in 2! Your synapses are firing on all cylinders today.",
  ],
  3: [
    "Textbook. Literally.",
    "Three tries — clean, efficient, ATP well spent.",
  ],
  4: [
    "Right in the middle of the bell curve, very natural selection of you.",
    "4/6, solid homeostasis energy.",
  ],
  5: [
    "Sweating a bit there, huh?",
    "5/6 — your sympathetic nervous system definitely kicked in on that one.",
  ],
  6: [
    "Clutch. Survival of the fittest, but barely.",
    "Phew! 6/6, hanging on by a single hydrogen bond.",
  ],
};

export const LOSS_MESSAGES: readonly string[] = [
  "Game over. The correct biological term was {WORD}.",
  "Out of guesses. The word was {WORD}.",
  "The secret word was {WORD}. Review the definition and try another round.",
  "Better luck next time. The target term was {WORD}.",
];

export function pickWordleWinMessage(
  guessCount: number,
  seed: number | string
): string {
  const clamped = Math.min(6, Math.max(1, guessCount));
  const pool = WIN_MESSAGES_BY_GUESS[clamped] ?? WIN_MESSAGES_BY_GUESS[6]!;
  return pick(pool, createRng(`${seed}:win:${clamped}`));
}

export function pickWordleLossMessage(
  answerWord: string,
  seed: number | string
): string {
  const template = pick(LOSS_MESSAGES, createRng(`${seed}:loss`));
  return template.replaceAll("{WORD}", answerWord.toUpperCase());
}

export function getWordleFollowUpMessage(
  won: boolean,
  hardMode: boolean
): string {
  if (won) {
    return hardMode
      ? "And you even beat it on Hard Mode! You, are the greatest biological mind I've ever known."
      : "Try Hard Mode if you're up for a bigger challenge";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}

