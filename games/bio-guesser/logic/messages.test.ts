import { describe, expect, it } from "vitest";
import {
  LINNAEUS_WIN_LINES,
  PLAYER_WIN_LINES,
  THINKING_LINES,
  WRONG_GUESS_LINES,
  pickLinnaeusWinLine,
  pickPlayerWinLine,
  pickThinkingLine,
  pickWrongGuessLine,
} from "./messages";

describe("Bio Guesser messages", () => {
  it("contains all required verbatim persona lines", () => {
    expect(THINKING_LINES).toContain("Hmm…");
    expect(THINKING_LINES).toContain("Interesting…");
    expect(THINKING_LINES).toContain("Ah, a classic.");
    expect(THINKING_LINES).toContain("Let me consult my notes…");

    expect(WRONG_GUESS_LINES).toContain(
      "Impossible. Did that organism evolve in the last five minutes?",
    );
    expect(WRONG_GUESS_LINES).toContain("Fine. FINE. Next question.");
    expect(WRONG_GUESS_LINES).toContain("A minor taxonomic hiccup.");

    expect(LINNAEUS_WIN_LINES).toContain(
      "Of course. I literally invented binomial nomenclature.",
    );
    expect(LINNAEUS_WIN_LINES).toContain("Classified. Next.");

    expect(PLAYER_WIN_LINES).toContain(
      "You've stumped me. I'll add it to the next edition of Systema Naturae.",
    );
    expect(PLAYER_WIN_LINES).toContain(
      "Well played. Even I didn't see that one evolving.",
    );
  });

  it("picks deterministically from each line pool", () => {
    expect(THINKING_LINES).toContain(pickThinkingLine(42));
    expect(WRONG_GUESS_LINES).toContain(pickWrongGuessLine(42));
    expect(LINNAEUS_WIN_LINES).toContain(pickLinnaeusWinLine(42));
    expect(PLAYER_WIN_LINES).toContain(pickPlayerWinLine(42));
  });
});

