import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TOPICS, WORD_LENGTHS } from "@/games/bio-wordle/config";
import { ANSWERS_BY_LENGTH, WORDLE_ANSWERS } from "@/games/bio-wordle/data/answers";

describe("games/bio-wordle/data/answers", () => {
  it("has unique 4-7 lowercase letter words with valid topic and definition <= 120 chars", () => {
    const seen = new Set<string>();
    for (const entry of WORDLE_ANSWERS) {
      expect(entry.word).toMatch(/^[a-z]{4,7}$/);
      expect(seen.has(entry.word)).toBe(false);
      seen.add(entry.word);
      expect(TOPICS[entry.topic]).toBeDefined();
      expect(entry.definition.length).toBeGreaterThanOrEqual(15);
      expect(entry.definition.length).toBeLessThanOrEqual(120);
    }
  });

  it("has at least 75 curated answers for every word length (4, 5, 6, 7)", () => {
    for (const len of WORD_LENGTHS) {
      expect(ANSWERS_BY_LENGTH[len].length).toBeGreaterThanOrEqual(75);
    }
  });

  it("includes every curated answer inside its corresponding allowed-N.txt dictionary", () => {
    for (const len of WORD_LENGTHS) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "assets",
        "data",
        "wordle",
        `allowed-${len}.txt`
      );
      expect(fs.existsSync(filePath)).toBe(true);
      const allowedWords = new Set(
        fs
          .readFileSync(filePath, "utf-8")
          .split(/\r?\n/)
          .map((w) => w.trim())
          .filter(Boolean)
      );

      for (const ans of ANSWERS_BY_LENGTH[len]) {
        expect(allowedWords.has(ans.word)).toBe(true);
      }
    }
  });
});
