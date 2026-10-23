import { describe, expect, it } from "vitest";
import { checkHardMode } from "@/games/bio-wordle/logic/hardMode";
import { scoreGuess } from "@/games/bio-wordle/logic/score";

describe("games/bio-wordle/logic/hardMode", () => {
  it("enforces green position locks with ordinal messages", () => {
    const prevGuesses = ["eexexx"];
    const prevResults = [scoreGuess("eexexx", "allele")]; // pos 4 (index 3) is E (correct), pos 1 is E (present)

    expect(checkHardMode("exxxxx", prevGuesses, prevResults)).toBe(
      "4th letter must be E"
    );
  });

  it("enforces count-aware yellow/green letter inclusion", () => {
    const prevGuesses = ["xlxlxl"];
    const prevResults = [scoreGuess("xlxlxl", "allele")]; // pos 2 is L (correct), plus 2 more L's present = 3 L's required

    // Pos 2 has L, so position check passes, but only 1 L total -> fails count check
    expect(checkHardMode("alxxxx", prevGuesses, prevResults)).toBe(
      "Guess must contain 3 L's"
    );

    // Single present letter requirement
    const singleGuesses = ["xexxxx"];
    const singleResults = [scoreGuess("xexxxx", "spore")];
    expect(checkHardMode("stump", singleGuesses, singleResults)).toBe(
      "Guess must contain E"
    );

    // Valid hard-mode guess passes with null
    expect(checkHardMode("allele", prevGuesses, prevResults)).toBeNull();
  });
});
