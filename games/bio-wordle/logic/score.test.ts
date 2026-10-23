import { describe, expect, it } from "vitest";
import { mergeKeyStates, scoreGuess } from "@/games/bio-wordle/logic/score";

describe("games/bio-wordle/logic/score", () => {
  it("matches the creator's exact worked examples for answer 'allele' verbatim", () => {
    const c = "correct" as const;
    const p = "present" as const;
    const a = "absent" as const;

    // xeexxx -> both E's present (allele has 2 E's)
    expect(scoreGuess("xeexxx", "allele")).toEqual([a, p, p, a, a, a]);

    // eeexxx -> first two E's present, third absent
    expect(scoreGuess("eeexxx", "allele")).toEqual([p, p, a, a, a, a]);

    // xlxlxl -> pos 2 L correct, the other two L's present (allele has 3 L's)
    expect(scoreGuess("xlxlxl", "allele")).toEqual([a, c, a, p, a, p]);

    // eexexx -> pos 4 E correct; one remaining E -> first E present, second absent
    expect(scoreGuess("eexexx", "allele")).toEqual([p, a, a, c, a, a]);
  });

  it("handles classic edge cases: all correct, no overlap, and single copy already green elsewhere", () => {
    expect(scoreGuess("xylem", "xylem")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);

    expect(scoreGuess("stump", "codon")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);

    // Answer 'spore' has 1 'e' at index 4; guess 'eexxe' has 'e' at 0, 1, 4 -> only index 4 is correct, 0 and 1 are absent
    expect(scoreGuess("eexxe", "spore")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "correct",
    ]);
  });

  it("upgrades keyboard states monotonically (absent < present < correct)", () => {
    let keys = mergeKeyStates({}, "xeexxx", scoreGuess("xeexxx", "allele"));
    expect(keys.x).toBe("absent");
    expect(keys.e).toBe("present");

    // Subsequent guess gets 'e' in the right position -> upgrades to 'correct'
    keys = mergeKeyStates(keys, "eexexx", scoreGuess("eexexx", "allele"));
    expect(keys.e).toBe("correct");
  });
});
