import { DISEASES, type Disease } from "@/games/symptoms-link/data/diseases";
import { dayNumber } from "@/lib/daily";
import { createRng, pick, shuffle, type Rng } from "@/lib/rng";

const SCHEDULE_SEED = "symptoms-link:schedule:v1";

/**
 * Daily schedule uses diseases with difficulty <= 2, shuffled deterministically.
 */
export function buildDiseaseSchedule(
  allDiseases: readonly Disease[] = DISEASES
): Disease[] {
  const pool = allDiseases.filter((d) => d.difficulty <= 2);
  return shuffle(pool, createRng(SCHEDULE_SEED));
}

const CACHED_SCHEDULE: readonly Disease[] = buildDiseaseSchedule();

export function getDiseaseSchedule(): readonly Disease[] {
  return CACHED_SCHEDULE;
}

export function diseaseFor(dayKey: string): Disease {
  const idx = dayNumber(dayKey);
  const len = CACHED_SCHEDULE.length;
  const mod = ((idx % len) + len) % len;
  return CACHED_SCHEDULE[mod]!;
}

/**
 * Practice mode picks randomly from ALL diseases (difficulties 1, 2, and 3).
 */
export function pickPracticeDisease(rng: Rng): Disease {
  return pick(DISEASES, rng);
}

