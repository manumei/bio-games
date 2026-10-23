import { describe, expect, it } from "vitest";
import { createRng } from "@/lib/rng";
import { MAX_SAME_GROUP, MIN_ANSWERS } from "../config";
import { ANIMALS } from "../data/animals";
import { TRAITS, getTrait } from "../data/traits";
import {
  answersFor,
  generateGrid,
  hasDistinctNineSolution,
  isValidGrid,
} from "./grid";

describe("generateGrid", () => {
  it("generates valid, solvable 3x3 grids for 500 consecutive seeds", () => {
    for (let seed = 1; seed <= 500; seed++) {
      const grid = generateGrid(createRng(seed), ANIMALS, TRAITS);
      const allSix = [...grid.rows, ...grid.cols];
      expect(new Set(allSix).size).toBe(6);

      const groupCounts = new Map<string, number>();
      for (const id of allSix) {
        const t = getTrait(id);
        groupCounts.set(t.group, (groupCounts.get(t.group) ?? 0) + 1);
      }
      for (const count of groupCounts.values()) {
        expect(count).toBeLessThanOrEqual(MAX_SAME_GROUP);
      }

      for (const rId of grid.rows) {
        const r = getTrait(rId);
        for (const cId of grid.cols) {
          const c = getTrait(cId);
          expect(
            r.exclusive && c.exclusive && r.group === c.group,
          ).toBeFalsy();
          expect(r.implies?.includes(c.id)).toBeFalsy();
          expect(c.implies?.includes(r.id)).toBeFalsy();

          const matches = answersFor(rId, cId, ANIMALS);
          expect(matches.length).toBeGreaterThanOrEqual(MIN_ANSWERS);
        }
      }

      expect(hasDistinctNineSolution(grid.rows, grid.cols, ANIMALS)).toBe(true);
      expect(isValidGrid(grid.rows, grid.cols, ANIMALS, TRAITS)).toBe(true);
    }
  });

  it("is deterministic for a given seed", () => {
    const g1 = generateGrid(createRng(42), ANIMALS, TRAITS);
    const g2 = generateGrid(createRng(42), ANIMALS, TRAITS);
    expect(g1).toEqual(g2);
  });

  it("falls back deterministically to FALLBACK_GRIDS if no grid can be built", () => {
    const fb = generateGrid(createRng(7), [], TRAITS, 5);
    expect(fb.rows).toHaveLength(3);
    expect(fb.cols).toHaveLength(3);
  });
});

