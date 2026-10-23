import { describe, expect, it } from "vitest";
import { generateGrid } from "@/games/taxo-bingo/logic/grid";
import { revealExamples } from "@/games/taxo-bingo/logic/reveal";
import { createRng } from "@/lib/rng";

describe("games/taxo-bingo/logic/reveal", () => {
  it("picks deterministic example organisms only for unfilled cells", () => {
    const grid = generateGrid(createRng(42));
    const placements: Record<string, string> = {
      [grid[0]!]: "homo_sapiens",
      [grid[3]!]: "panthera_leo",
    };

    const first = revealExamples(grid, placements, 20260417);
    const second = revealExamples(grid, placements, 20260417);

    expect(first).toEqual(second);
    expect(first[grid[0]!]).toBeUndefined();
    expect(first[grid[3]!]).toBeUndefined();
    expect(Object.keys(first)).toHaveLength(10);

    for (const [taxonId, org] of Object.entries(first)) {
      expect(org.path).toContain(taxonId);
    }
  });
});
