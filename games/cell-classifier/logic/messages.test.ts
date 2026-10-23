import { describe, expect, it } from "vitest";
import {
  HARD_MODE_STUDY_TOOLTIP,
  SCORE_10_MESSAGES,
  SCORE_HIGH_MESSAGES,
  SCORE_LOW_MESSAGES,
  SCORE_MID_MESSAGES,
  SCORE_ZERO_MESSAGES,
  UNKNOWN_PART_TOAST,
  getCellFollowUpMessage,
  pickCellEndMessage,
} from "./messages";

describe("Cell Classifier messages", () => {
  it("contains verbatim spec message lines", () => {
    expect(HARD_MODE_STUDY_TOOLTIP).toBe(
      "Your Golgi apparatus should have packaged this knowledge already.",
    );
    expect(UNKNOWN_PART_TOAST).toBe("That's not a cell part we know");
    expect(SCORE_10_MESSAGES).toContain(
      "Perfect. Mitochondria is the powerhouse of the cell and you are the powerhouse of this quiz.",
    );
    expect(SCORE_HIGH_MESSAGES).toContain(
      "Cellular excellence. Only a few ribosomes out of place.",
    );
    expect(SCORE_MID_MESSAGES).toContain(
      "Mid. Your cell is functional, just not thriving.",
    );
    expect(SCORE_LOW_MESSAGES).toContain(
      "Your organelles are in shambles. Vayan a estudiar.",
    );
    expect(SCORE_ZERO_MESSAGES).toContain(
      "0/10. Are you sure you're not a virus? They don't have cells either.",
    );
  });

  it("picks from the right tier by score", () => {
    expect(SCORE_10_MESSAGES).toContain(pickCellEndMessage(10, 1));
    expect(SCORE_HIGH_MESSAGES).toContain(pickCellEndMessage(8, 1));
    expect(SCORE_MID_MESSAGES).toContain(pickCellEndMessage(6, 1));
    expect(SCORE_LOW_MESSAGES).toContain(pickCellEndMessage(3, 1));
    expect(SCORE_ZERO_MESSAGES).toContain(pickCellEndMessage(0, 1));
  });

  it("returns appropriate follow-up lines", () => {
    expect(getCellFollowUpMessage(true, true)).toContain("Hard Mode");
    expect(getCellFollowUpMessage(true, false)).toContain("Try Hard Mode");
    expect(getCellFollowUpMessage(false, true)).toContain("Hard mode");
    expect(getCellFollowUpMessage(false, false)).toContain("starting point");
  });
});

