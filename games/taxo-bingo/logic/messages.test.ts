import { describe, expect, it } from "vitest";
import {
  LOSS_MESSAGE_POOLS,
  ZERO_MISTAKES_MESSAGE,
  pickLossMessage,
} from "@/games/taxo-bingo/logic/messages";

describe("games/taxo-bingo/logic/messages", () => {
  it("contains standard serious messages for each loss bracket", () => {
    expect(LOSS_MESSAGE_POOLS["11"]).toContain(
      '11 out of 12 categories completed. Just missed the final "{cat}".'
    );
    expect(LOSS_MESSAGE_POOLS["9-10"]).toContain(
      "{n} out of 12 categories identified. Solid taxonomic classification."
    );
    expect(LOSS_MESSAGE_POOLS["6-8"]).toContain(
      "{n} out of 12 categories identified. Halfway through the grid."
    );
    expect(LOSS_MESSAGE_POOLS["3-5"]).toContain(
      "{n} out of 12 categories matched. Review the taxonomy tree and try another round."
    );
    expect(LOSS_MESSAGE_POOLS["1-2"]).toContain(
      "{n} out of 12 categories matched. Review the taxonomic categories and try again."
    );
    expect(LOSS_MESSAGE_POOLS["0"]).toContain(
      "0 out of 12 categories matched. Review the taxonomic groups and try again."
    );

    expect(ZERO_MISTAKES_MESSAGE).toBe(
      "Zero wrong clicks. Linnaeus is shaking."
    );
  });

  it("picks deterministically for a given seed and substitutes {cat} and {n}", () => {
    const first = pickLossMessage(11, "Porifera", false, 12345);
    const second = pickLossMessage(11, "Porifera", false, 12345);
    expect(first).toBe(second);
    expect(first).toContain("Porifera");

    const mid = pickLossMessage(7, undefined, false, 999);
    expect(mid).toBe(pickLossMessage(7, undefined, false, 999));
  });

  it("never picks a Cheat Sheet recommendation in hard mode", () => {
    for (let seed = 0; seed < 100; seed++) {
      const msg1 = pickLossMessage(1, undefined, true, seed);
      const msg2 = pickLossMessage(2, undefined, true, seed);
      expect(msg1.toLowerCase()).not.toContain("cheat sheet");
      expect(msg2.toLowerCase()).not.toContain("cheat sheet");
    }
  });
});
