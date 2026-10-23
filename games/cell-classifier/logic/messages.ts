import { createRng, pick } from "@/lib/rng";

export const HARD_MODE_STUDY_TOOLTIP =
  "Your Golgi apparatus should have packaged this knowledge already.";

export const UNKNOWN_PART_TOAST = "That's not a cell part we know";

export const SCORE_10_MESSAGES: readonly string[] = [
  "Perfect. Mitochondria is the powerhouse of the cell and you are the powerhouse of this quiz.",
  "10/10! Robert Hooke and Antonie van Leeuwenhoek are giving you a standing ovation.",
];

export const SCORE_HIGH_MESSAGES: readonly string[] = [
  "Cellular excellence. Only a few ribosomes out of place.",
  "Strong cytology! Your cell passed its cell-cycle checkpoint with flying colors.",
];

export const SCORE_MID_MESSAGES: readonly string[] = [
  "Moderate cytology score. Review the organelle diagrams to improve your accuracy.",
  "Fair attempt. Practice identifying internal cell structures to strengthen recall.",
];

export const SCORE_LOW_MESSAGES: readonly string[] = [
  "Round complete. Study the cell anatomy diagram and try another round.",
  "Room for improvement. Review organelle functions in the study guide and try again.",
];

export const SCORE_ZERO_MESSAGES: readonly string[] = [
  "0/10. Review the cell diagram and try again.",
];

export function pickCellEndMessage(
  score: number,
  seed: number | string,
): string {
  if (score >= 10) {
    return pick(SCORE_10_MESSAGES, createRng(`${seed}:10`));
  }
  if (score >= 8) {
    return pick(SCORE_HIGH_MESSAGES, createRng(`${seed}:high`));
  }
  if (score >= 5) {
    return pick(SCORE_MID_MESSAGES, createRng(`${seed}:mid`));
  }
  if (score >= 1) {
    return pick(SCORE_LOW_MESSAGES, createRng(`${seed}:low`));
  }
  return SCORE_ZERO_MESSAGES[0];
}

export function getCellFollowUpMessage(
  passed: boolean,
  hardMode: boolean,
): string {
  if (passed) {
    return hardMode
      ? "And you even aced it on Hard Mode! You, are the greatest cell biologist I've ever known."
      : "Try Hard Mode if you're ready for bacteria, free-text typing, and tiny organelles";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}

