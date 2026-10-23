import { describe, expect, it } from "vitest";
import { WORDLE_ANSWERS } from "@/games/bio-wordle/data/answers";
import {
  answerFor,
  buildAnswerSchedule,
  getAnswerSchedule,
} from "@/games/bio-wordle/logic/schedule";

describe("games/bio-wordle/logic/schedule", () => {
  it("builds a deterministic schedule with no repeats within a cycle and all lengths in early rounds", () => {
    const first = buildAnswerSchedule();
    const second = getAnswerSchedule();

    expect(first).toEqual(second);
    expect(first).toHaveLength(WORDLE_ANSWERS.length);

    const uniqueWords = new Set(first.map((a) => a.word));
    expect(uniqueWords.size).toBe(WORDLE_ANSWERS.length);

    // For the first 75 rounds (300 days), every block of 4 consecutive days has all 4 lengths {4,5,6,7}
    for (let r = 0; r < 75; r++) {
      const blockLengths = new Set(
        first.slice(r * 4, r * 4 + 4).map((a) => a.word.length)
      );
      expect(blockLengths).toEqual(new Set([4, 5, 6, 7]));
    }
  });

  it("maps dayKey deterministically to an Answer", () => {
    const a1 = answerFor("2026-04-17");
    const a2 = answerFor("2026-04-17");
    const a3 = answerFor("2026-04-18");

    expect(a1).toEqual(a2);
    expect(a1.word).not.toBe(a3.word);
  });
});

