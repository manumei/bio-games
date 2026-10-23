import { describe, expect, it } from "vitest";
import { createRng } from "@/lib/rng";
import { ROUND_SIZE } from "../config";
import { getPart } from "../data/parts";
import {
  generateClassifyQuestion,
  generateRound,
  resolveUniqueCellForParts,
} from "./questions";

describe("Cell Classifier question generator", () => {
  it("generates 10 balanced questions without duplicate (cell, partId) pairs in normal mode", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const round = generateRound(createRng(seed), false);
      expect(round).toHaveLength(ROUND_SIZE);

      const nameQs = round.filter((q) => q.type === "name");
      const findQs = round.filter((q) => q.type === "find");
      const classifyQs = round.filter((q) => q.type === "classify");

      expect(nameQs.length).toBeGreaterThanOrEqual(4);
      expect(nameQs.length).toBeLessThanOrEqual(6);
      expect(findQs.length).toBeGreaterThanOrEqual(4);
      expect(findQs.length).toBeLessThanOrEqual(6);
      expect(classifyQs.length).toBe(1);

      const seenPairs = new Set<string>();
      const partCounts = new Map<string, number>();

      for (const q of round) {
        expect(["animal", "plant"]).toContain(q.cell);
        const part = getPart(q.partId);
        expect(part.difficulty).toBeLessThanOrEqual(2);

        if (q.type !== "classify") {
          const pairKey = `${q.cell}:${q.partId}`;
          expect(seenPairs.has(pairKey)).toBe(false);
          seenPairs.add(pairKey);
          partCounts.set(q.partId, (partCounts.get(q.partId) ?? 0) + 1);
          expect(partCounts.get(q.partId)!).toBeLessThanOrEqual(2);
        }

        if (q.type === "name") {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.options).toContain(q.partId);
        }
      }
    }
  });

  it("includes bacteria and difficulty 3 parts in hard mode", () => {
    const cellsSeen = new Set<string>();
    let sawDiff3 = false;
    for (let seed = 1; seed <= 30; seed++) {
      const round = generateRound(createRng(seed), true);
      for (const q of round) {
        cellsSeen.add(q.cell);
        if (getPart(q.partId).difficulty === 3) {
          sawDiff3 = true;
        }
      }
    }
    expect(cellsSeen).toEqual(new Set(["animal", "plant", "bacteria"]));
    expect(sawDiff3).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    const r1 = generateRound(createRng(123), true);
    const r2 = generateRound(createRng(123), true);
    expect(r1).toEqual(r2);
  });

  it("verifies uniqueness for 'Which cell is it?' combinations", () => {
    // cell_wall + nucleus -> plant
    expect(
      resolveUniqueCellForParts(["cell_wall", "nucleus", "cytoplasm"]),
    ).toBe("plant");
    // nucleoid -> bacteria
    expect(
      resolveUniqueCellForParts(["nucleoid", "ribosome", "cell_membrane"]),
    ).toBe("bacteria");
    // centriole + lysosome -> animal
    expect(
      resolveUniqueCellForParts(["centriole", "lysosome", "mitochondrion"]),
    ).toBe("animal");
    // shared by animal + plant -> null (not unique)
    expect(
      resolveUniqueCellForParts(["nucleus", "mitochondrion", "golgi"]),
    ).toBeNull();

    for (let seed = 1; seed <= 200; seed++) {
      const q = generateClassifyQuestion(createRng(seed));
      expect(q.type).toBe("classify");
      expect(q.cluePartIds).toHaveLength(3);
      expect(resolveUniqueCellForParts(q.cluePartIds!)).toBe(q.cell);
    }
  });
});

