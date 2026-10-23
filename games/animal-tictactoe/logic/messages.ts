import { createRng, pick } from "@/lib/rng";

export const HARD_MODE_ANIMAL_LIST_TOOLTIP =
  "You're supposed to know animals. That's the whole game.";

export const FLAWLESS_WIN_MESSAGES: readonly string[] = [
  "Perfect grid, zero wasted guesses. Are you a zookeeper?",
  "9 for 9 without a single miss. Steve Irwin is smiling down on you.",
];

export const WIN_MESSAGES: readonly string[] = [
  "9/9. David Attenborough just followed you.",
  "Full Noah's Ark speedrun. Every single niche accounted for.",
  "You filled the whole ecosystem! National Geographic wants to know your location.",
];

export const LOSS_CLOSE_MESSAGES: readonly string[] = [
  "7 of 9 cells claimed. A strong effort, but the grid remains incomplete.",
  "Almost there! Just a couple of animal niches remained unclaimed.",
];

export const LOSS_MID_MESSAGES: readonly string[] = [
  "Grid partially completed. Review animal traits and try another round.",
  "Good attempt. Expand your species recall and give it another try.",
];

export const LOSS_LOW_MESSAGES: readonly string[] = [
  "Grid incomplete. Practice matching traits with diverse animal classes to improve your score.",
  "Game over. Study animal classifications and try again.",
];

export function pickTicTacEndMessage(
  won: boolean,
  filledCount: number,
  guessesUsed: number,
  seed: number | string,
): string {
  if (won) {
    if (guessesUsed <= 9) {
      return pick(FLAWLESS_WIN_MESSAGES, createRng(`${seed}:win:flawless`));
    }
    return pick(WIN_MESSAGES, createRng(`${seed}:win`));
  }
  if (filledCount >= 7) {
    return pick(LOSS_CLOSE_MESSAGES, createRng(`${seed}:loss:close`));
  }
  if (filledCount >= 3) {
    return pick(LOSS_MID_MESSAGES, createRng(`${seed}:loss:mid`));
  }
  return pick(LOSS_LOW_MESSAGES, createRng(`${seed}:loss:low`));
}

export function getTicTacFollowUpMessage(
  won: boolean,
  hardMode: boolean,
): string {
  if (won) {
    return hardMode
      ? "And you even cleared it on Hard Mode! You, are the greatest zoologist I've ever known."
      : "Try Hard Mode if you're up for a bigger challenge";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}

