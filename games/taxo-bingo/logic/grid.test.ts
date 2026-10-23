import { describe, expect, it } from "vitest";
import { organismsInTaxon } from "@/data/organisms";
import {
  ALWAYS_INCLUDED_TAXON,
  DOMAIN_SLOT,
  GRID_SIZE,
  KINGDOM_SLOT,
  MIN_ORGANISMS_PER_CATEGORY,
} from "@/games/taxo-bingo/config";
import { generateGrid } from "@/games/taxo-bingo/logic/grid";
import { createRng } from "@/lib/rng";

describe("games/taxo-bingo/logic/grid", () => {
  it("always produces 12 unique categories obeying slot rules and solvability", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const grid = generateGrid(createRng(seed));
      expect(grid).toHaveLength(GRID_SIZE);
      expect(new Set(grid).size).toBe(GRID_SIZE);

      const domains = grid.filter((id) => DOMAIN_SLOT.includes(id));
      expect(domains).toHaveLength(1);

      const kingdoms = grid.filter((id) => KINGDOM_SLOT.includes(id));
      expect(kingdoms).toHaveLength(1);

      expect(grid).toContain(ALWAYS_INCLUDED_TAXON);

      for (const taxonId of grid) {
        expect(organismsInTaxon(taxonId).length).toBeGreaterThanOrEqual(
          MIN_ORGANISMS_PER_CATEGORY
        );
      }
    }
  });

  it("is deterministic for a fixed seed and produces different domain/kingdom picks across seeds", () => {
    const gridA = generateGrid(createRng("seed-1"));
    const gridB = generateGrid(createRng("seed-1"));
    expect(gridA).toEqual(gridB);

    const seenDomains = new Set<string>();
    const seenKingdoms = new Set<string>();
    for (let s = 1; s <= 30; s++) {
      const g = generateGrid(createRng(s));
      for (const id of g) {
        if (DOMAIN_SLOT.includes(id)) seenDomains.add(id);
        if (KINGDOM_SLOT.includes(id)) seenKingdoms.add(id);
      }
    }
    expect(seenDomains.size).toBe(DOMAIN_SLOT.length);
    expect(seenKingdoms.size).toBe(KINGDOM_SLOT.length);
  });
});
