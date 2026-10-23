import { describe, expect, it } from "vitest";
import {
  HARD_MODE_GLOSSARY_TOOLTIP,
  LOSS_MESSAGES,
  LUPUS_LOSS_MESSAGE,
  LUPUS_WRONG_TOAST,
  WIN_MESSAGES_BY_STAGE,
  pickLinkLossMessage,
  pickLinkWinMessage,
} from "@/games/symptoms-link/logic/messages";

describe("games/symptoms-link/logic/messages", () => {
  it("contains all spec strings verbatim including the Lupus Easter egg", () => {
    expect(WIN_MESSAGES_BY_STAGE[1]).toContain(
      "Diagnosed from ONE symptom. Dr. House is unemployed now."
    );
    expect(WIN_MESSAGES_BY_STAGE[2]).toContain(
      "Two symptoms and you already called it. Med school wants your number."
    );
    expect(WIN_MESSAGES_BY_STAGE[3]).toContain("Solid diagnosis, doctor.");
    expect(WIN_MESSAGES_BY_STAGE[4]).toContain(
      "Took a few tests, but the patient lives."
    );
    expect(WIN_MESSAGES_BY_STAGE[5]).toContain(
      "Last-second diagnosis. The patient was flatlining, but we take those."
    );

    expect(LOSS_MESSAGES).toContain(
      "It was {Disease}. The patient did not make it 🥀"
    );
    expect(LOSS_MESSAGES).toContain(
      "It was {Disease}. Vayan a estudiar (medicina)."
    );
    expect(LUPUS_WRONG_TOAST).toBe("It's never lupus.");
    expect(LUPUS_LOSS_MESSAGE).toBe(
      "It's never lupus… except today it was."
    );
    expect(HARD_MODE_GLOSSARY_TOOLTIP).toBe(
      "Real doctors don't get a cheat sheet either. Well… they have Google."
    );
  });

  it("returns the special lupus loss line when the answer was lupus", () => {
    expect(pickLinkLossMessage("lupus", "Lupus", 42)).toBe(
      "It's never lupus… except today it was."
    );
    expect(pickLinkWinMessage(1, 42)).toBe(pickLinkWinMessage(1, 42));
  });
});
