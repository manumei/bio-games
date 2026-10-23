import { describe, expect, it } from "vitest";
import {
  HARD_MODE_HINT_TOOLTIP,
  LOSS_MESSAGES,
  WIN_MESSAGES_BY_GUESS,
  pickWordleLossMessage,
  pickWordleWinMessage,
} from "@/games/bio-wordle/logic/messages";

describe("games/bio-wordle/logic/messages", () => {
  it("contains all spec-mandated win, loss, and tooltip strings verbatim", () => {
    expect(WIN_MESSAGES_BY_GUESS[1]).toContain(
      "First try?? Either you're a genius or you read the source code 👀"
    );
    expect(WIN_MESSAGES_BY_GUESS[2]).toContain(
      "Two guesses. Darwin would've taken notes."
    );
    expect(WIN_MESSAGES_BY_GUESS[3]).toContain("Textbook. Literally.");
    expect(WIN_MESSAGES_BY_GUESS[4]).toContain(
      "Right in the middle of the bell curve, very natural selection of you."
    );
    expect(WIN_MESSAGES_BY_GUESS[5]).toContain("Sweating a bit there, huh?");
    expect(WIN_MESSAGES_BY_GUESS[6]).toContain(
      "Clutch. Survival of the fittest, but barely."
    );

    expect(LOSS_MESSAGES).toContain("It was {WORD}. Vayan a estudiar.");
    expect(LOSS_MESSAGES).toContain(
      "{WORD}. Not even a mitochondrion could power you through that one."
    );
    expect(LOSS_MESSAGES).toContain(
      "The word was {WORD}. Not great, not terrible… ok it was terrible."
    );

    expect(HARD_MODE_HINT_TOOLTIP).toBe(
      "Hints? In Hard Mode? Bold of you to assume."
    );
  });

  it("picks deterministically for a seed and uppercases {WORD} on loss", () => {
    expect(pickWordleWinMessage(3, 42)).toBe(pickWordleWinMessage(3, 42));
    const loss = pickWordleLossMessage("xylem", 42);
    expect(loss).toBe(pickWordleLossMessage("xylem", 42));
    expect(loss).toContain("XYLEM");
  });
});
