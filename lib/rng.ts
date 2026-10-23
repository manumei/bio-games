export type Rng = () => number;

/**
 * Stable 32-bit FNV-1a unsigned hash for strings.
 */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic Mulberry32 PRNG returning uniform numbers in [0, 1).
 */
export function createRng(seed: number | string): Rng {
  let state = (typeof seed === "string" ? hashString(seed) : seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a non-deterministic 32-bit unsigned seed.
 */
export function randomSeed(): number {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0]!;
  }
  return (Math.random() * 0x100000000) >>> 0;
}

/**
 * Uniform integer in [min, maxInclusive].
 */
export function randomInt(
  min: number,
  maxInclusive: number,
  rng: Rng
): number {
  const low = Math.ceil(min);
  const high = Math.floor(maxInclusive);
  if (high < low) {
    throw new RangeError(
      `Invalid range: min (${min}) > maxInclusive (${maxInclusive})`
    );
  }
  return low + Math.floor(rng() * (high - low + 1));
}

/**
 * Pick one random element from a non-empty array.
 */
export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) {
    throw new RangeError("Cannot pick from an empty array");
  }
  const index = Math.floor(rng() * items.length);
  return items[index]!;
}

/**
 * Non-mutating Fisher-Yates shuffle.
 */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Return n unique randomly sampled items without replacement.
 */
export function sample<T>(items: readonly T[], n: number, rng: Rng): T[] {
  if (n < 0 || n > items.length) {
    throw new RangeError(
      `Cannot sample ${n} items from an array of length ${items.length}`
    );
  }
  const copy = [...items];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy.slice(0, n);
}
