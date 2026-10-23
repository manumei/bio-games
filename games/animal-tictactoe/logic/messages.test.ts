import { describe, expect, it } from "vitest";
import {
  FLAWLESS_WIN_MESSAGES,
  HARD_MODE_ANIMAL_LIST_TOOLTIP,
  LOSS_CLOSE_MESSAGES,
  LOSS_LOW_MESSAGES,
  WIN_MESSAGES,
  getTicTacFollowUpMessage,
  pickTicTacEndMessage,
} from "./messages";

describe("Animal Tic-Tac-Toe messages", () => {
  it("contains required verbatim spec lines", () => {
    expect(HARD_MODE_ANIMAL_LIST_TOOLTIP).toBe(
      "You're supposed to know animals. That's the whole game.",
    );
    expect(FLAWLESS_WIN_MESSAGES).toContain(
      "Perfect grid, zero wasted guesses. Are you a zookeeper?",
    );
    expect(WIN_MESSAGES).toContain(
      "9/9. David Attenborough just followed you.",
    );
    expect(LOSS_CLOSE_MESSAGES).toContain(
      "So close. That last cell is still out there, roaming free.",
    );
    expect(LOSS_LOW_MESSAGES).toContain("Vayan a estudiar (zoología).");
  });

  it("picks from the appropriate pool based on outcome and filled count", () => {
    expect(FLAWLESS_WIN_MESSAGES).toContain(pickTicTacEndMessage(true, 9, 9, 1));
    expect(WIN_MESSAGES).toContain(pickTicTacEndMessage(true, 9, 11, 1));
    expect(LOSS_CLOSE_MESSAGES).toContain(pickTicTacEndMessage(false, 8, 15, 1));
    expect(LOSS_LOW_MESSAGES).toContain(pickTicTacEndMessage(false, 1, 15, 1));
  });

  it("returns appropriate hard-mode follow-up messages", () => {
    expect(getTicTacFollowUpMessage(true, true)).toContain("Hard Mode");
    expect(getTicTacFollowUpMessage(true, false)).toContain("Try Hard Mode");
    expect(getTicTacFollowUpMessage(false, true)).toContain("Hard mode");
    expect(getTicTacFollowUpMessage(false, false)).toContain("starting point");
  });
});

