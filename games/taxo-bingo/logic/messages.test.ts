import { describe, expect, it } from "vitest";
import {
  getFollowUpMessage,
  getLossMessage,
} from "@/games/taxo-bingo/logic/messages";

describe("games/taxo-bingo/logic/messages", () => {
  it("returns exact loss messages for every filled count 0..11", () => {
    expect(getLossMessage(0)).toBe("0 out of 12, vayan a estudiar");

    for (const count of [1, 2]) {
      expect(getLossMessage(count)).toBe(
        `${count}/12, I guess it was a pretty hard game, maybe check out the Cheat Sheet`
      );
    }

    for (const count of [3, 4, 5]) {
      expect(getLossMessage(count)).toBe(
        `${count} out of 12, tough luck I guess, im sure it's just a warm up gamr tho`
      );
    }

    for (const count of [6, 7, 8]) {
      expect(getLossMessage(count)).toBe(
        `${count} cells... not great, not terrible`
      );
    }

    for (const count of [9, 10]) {
      expect(getLossMessage(count)).toBe(
        "You came quite close, even I couldn't do all 12 cells at first, and I made this game by hand"
      );
    }

    expect(getLossMessage(11, "Nematoda")).toBe(
      'ikr, that one "Nematoda" you probably skimmed through or just didn\'t wanna show up'
    );
  });

  it("returns exact follow-up messages for win/loss and normal/hard mode", () => {
    expect(getFollowUpMessage(true, true)).toBe(
      "And you even beat it on Hard Mode! You, are the greatest biological mind I've ever known."
    );
    expect(getFollowUpMessage(true, false)).toBe(
      "Try Hard Mode if you're up for a bigger challenge"
    );
    expect(getFollowUpMessage(false, true)).toBe(
      "Don't give up! Hard mode is tough, but you can do it!"
    );
    expect(getFollowUpMessage(false, false)).toBe(
      "Remember, failure is the starting point for learning."
    );
  });
});
