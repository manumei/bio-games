import { createRng, pick } from "@/lib/rng";

export const HARD_MODE_GLOSSARY_TOOLTIP =
  "Real doctors don't get a cheat sheet either. Well… they have Google.";

export const LUPUS_WRONG_TOAST = "It's never lupus.";

export const LUPUS_LOSS_MESSAGE =
  "The correct diagnosis was Systemic Lupus Erythematosus. Review the presentation and try another case.";

export const WIN_MESSAGES_BY_STAGE: Readonly<
  Record<number, readonly string[]>
> = {
  1: [
    "Diagnosed from ONE symptom. Dr. House is unemployed now.",
    "One symptom?? Either you have psychic clinical intuition or you're the pathogen.",
  ],
  2: [
    "Two symptoms and you already called it. Med school wants your number.",
    "Diagnosed at stage 2 — Chief of Medicine speedrun.",
  ],
  3: [
    "Solid diagnosis, doctor.",
    "3/5 symptoms. Balanced clinical workup, insurance actually approved it.",
  ],
  4: [
    "Took a few tests, but the patient lives.",
    "4/5 symptoms — ordered half the lab menu, nailed the differential.",
  ],
  5: [
    "Last-second diagnosis. The patient was flatlining, but we take those.",
    "5/5! You needed the textbook hallmark symptom, but a save is a save.",
  ],
};

export const LOSS_MESSAGES: readonly string[] = [
  "The correct diagnosis was {Disease}. Review the clinical signs and try another case.",
  "Case closed. The correct condition was {Disease}.",
  "Diagnosis missed: {Disease}. Better luck next time.",
];

export function pickLinkWinMessage(
  stage: number,
  seed: number | string
): string {
  const clamped = Math.min(5, Math.max(1, stage));
  const pool = WIN_MESSAGES_BY_STAGE[clamped] ?? WIN_MESSAGES_BY_STAGE[5]!;
  return pick(pool, createRng(`${seed}:win:${clamped}`));
}

export function pickLinkLossMessage(
  diseaseId: string,
  diseaseName: string,
  seed: number | string
): string {
  if (diseaseId === "lupus") {
    return LUPUS_LOSS_MESSAGE;
  }
  const template = pick(LOSS_MESSAGES, createRng(`${seed}:loss`));
  return template.replaceAll("{Disease}", diseaseName);
}

export function getLinkFollowUpMessage(
  won: boolean,
  hardMode: boolean
): string {
  if (won) {
    return hardMode
      ? "And you even diagnosed it on Hard Mode! You, are the greatest diagnostic mind I've ever known."
      : "Try Hard Mode if you're up for a bigger clinical challenge";
  }
  return hardMode
    ? "Don't give up! Hard mode is tough, but you can do it!"
    : "Remember, failure is the starting point for learning.";
}

