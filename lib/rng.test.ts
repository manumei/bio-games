import { describe, expect, it } from "vitest";
import {
  createRng,
  hashString,
  pick,
  randomInt,
  sample,
  shuffle,
} from "@/lib/rng";

describe("lib/rng", () => {
  it("produces deterministic sequences for identical numeric or string seeds", () => {
    const rngA1 = createRng(123456);
    const rngA2 = createRng(123456);
    const seq1 = Array.from({ length: 10 }, () => rngA1());
    const seq2 = Array.from({ length: 10 }, () => rngA2());
    expect(seq1).toEqual(seq2);

    const strA = createRng("taxo-bingo:2026-10-23");
    const strB = createRng("taxo-bingo:2026-10-23");
    const strDiff = createRng("taxo-bingo:2026-10-24");
    expect(Array.from({ length: 5 }, () => strA())).toEqual(
      Array.from({ length: 5 }, () => strB())
    );
    expect(hashString("taxo-bingo:2026-10-23")).not.toBe(
      hashString("taxo-bingo:2026-10-24")
    );
    expect(strDiff()).not.toBe(createRng("taxo-bingo:2026-10-23")());
  });

  it("shuffle returns a valid permutation without mutating the input array", () => {
    const input = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const rng = createRng("shuffle-seed");
    const out = shuffle(input, rng);

    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual([...input]);
    expect(out).not.toEqual(input);
  });

  it("sample returns n unique elements and throws on invalid n", () => {
    const pool = ["a", "b", "c", "d", "e", "f", "g"];
    const rng = createRng(42);
    const picked = sample(pool, 5, rng);

    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
    for (const item of picked) {
      expect(pool).toContain(item);
    }

    expect(() => sample(pool, -1, rng)).toThrow(RangeError);
    expect(() => sample(pool, pool.length + 1, rng)).toThrow(RangeError);
  });

  it("pick throws on an empty array and returns an element when non-empty", () => {
    const rng = createRng(99);
    expect(() => pick([], rng)).toThrow(RangeError);
    expect(["x", "y", "z"]).toContain(pick(["x", "y", "z"], rng));
  });

  it("randomInt stays within inclusive bounds", () => {
    const rng = createRng(7);
    for (let i = 0; i < 100; i++) {
      const value = randomInt(3, 7, rng);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
    }
    expect(() => randomInt(10, 5, rng)).toThrow(RangeError);
  });
});
