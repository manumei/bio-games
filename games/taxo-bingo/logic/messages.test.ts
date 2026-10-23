import { describe, expect, it } from "vitest";
import {
  LOSS_MESSAGE_POOLS,
  ZERO_MISTAKES_MESSAGE,
  pickLossMessage,
} from "@/games/taxo-bingo/logic/messages";

describe("games/taxo-bingo/logic/messages", () => {
  it("contains every shipped and original-notes message verbatim", () => {
    expect(LOSS_MESSAGE_POOLS["11"]).toContain(
      'ikr, that one "{cat}" you probably skimmed through or just didn\'t wanna show up'
    );
    expect(LOSS_MESSAGE_POOLS["11"]).toContain(
      "AAA ikr, that one {cat} you probably skimmed through or just didn't wanna show up"
    );

    expect(LOSS_MESSAGE_POOLS["9-10"]).toContain(
      "You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand"
    );
    expect(LOSS_MESSAGE_POOLS["9-10"]).toContain(
      "You came quite close, even I couldn't do all 12 cells at first, and I literally made this game by hand"
    );

    expect(LOSS_MESSAGE_POOLS["6-8"]).toContain(
      "{n} cells... not great, not terrible"
    );
    expect(LOSS_MESSAGE_POOLS["6-8"]).toContain(
      "{n} Roentgen, not great, not terrible"
    );

    expect(LOSS_MESSAGE_POOLS["3-5"]).toContain(
      "{n} out of 12, tough luck I guess, im sure it's just a warm up gamr tho"
    );
    expect(LOSS_MESSAGE_POOLS["3-5"]).toContain(
      "Warm Up game fr, I'm sure you'll do better next time"
    );

    expect(LOSS_MESSAGE_POOLS["1-2"]).toContain(
      "{n}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet"
    );
    expect(LOSS_MESSAGE_POOLS["1-2"]).toContain("vayan a estudiar");

    expect(LOSS_MESSAGE_POOLS["0"]).toContain("0 out of 12, vayan a estudiar");
    expect(LOSS_MESSAGE_POOLS["0"]).toContain(
      "dont even blame the RNG, just put the fries in the bag lil bro"
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
