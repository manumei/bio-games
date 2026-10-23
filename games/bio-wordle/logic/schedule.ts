import { WORD_LENGTHS, type WordLength } from "@/games/bio-wordle/config";
import { ANSWERS_BY_LENGTH, type Answer } from "@/games/bio-wordle/data/answers";
import { dayNumber } from "@/lib/daily";
import { createRng, pick, shuffle, type Rng } from "@/lib/rng";

const SCHEDULE_SEED = "bio-wordle:schedule:v1";

/**
 * Build the deterministic round-robin length-interleaved schedule of all Bio Wordle answers.
 * Every round of 4 days visits lengths {4, 5, 6, 7} in a shuffled order without repeats.
 */
export function buildAnswerSchedule(
  byLength: Readonly<Record<WordLength, readonly Answer[]>> = ANSWERS_BY_LENGTH
): Answer[] {
  const rng = createRng(SCHEDULE_SEED);
  const buckets: Record<WordLength, Answer[]> = {
    4: shuffle(byLength[4], rng),
    5: shuffle(byLength[5], rng),
    6: shuffle(byLength[6], rng),
    7: shuffle(byLength[7], rng),
  };

  const maxRounds = Math.max(
    buckets[4].length,
    buckets[5].length,
    buckets[6].length,
    buckets[7].length
  );

  const schedule: Answer[] = [];
  for (let round = 0; round < maxRounds; round++) {
    const lengthOrder = shuffle(WORD_LENGTHS, rng);
    for (const len of lengthOrder) {
      const candidate = buckets[len][round];
      if (candidate) {
        schedule.push(candidate);
      }
    }
  }

  return schedule;
}

const CACHED_SCHEDULE: readonly Answer[] = buildAnswerSchedule();

export function getAnswerSchedule(): readonly Answer[] {
  return CACHED_SCHEDULE;
}

/**
 * Deterministic daily answer for a given local dayKey ("YYYY-MM-DD").
 */
export function answerFor(dayKey: string): Answer {
  const idx = dayNumber(dayKey);
  const len = CACHED_SCHEDULE.length;
  const mod = ((idx % len) + len) % len;
  return CACHED_SCHEDULE[mod]!;
}

/**
 * Pick a practice answer: uniform random length in [4, 5, 6, 7], then a random answer of that length.
 */
export function pickPracticeAnswer(rng: Rng): Answer {
  const length = pick(WORD_LENGTHS, rng);
  return pick(ANSWERS_BY_LENGTH[length], rng);
}
