import { describe, expect, it } from "vitest";
import { toStandardGalactic } from "@/games/taxo-bingo/logic/sga";

describe("games/taxo-bingo/logic/sga", () => {
  it("converts letters to Standard Galactic Alphabet glyphs and preserves spaces/punctuation", () => {
    expect(toStandardGalactic("Panthera tigris")).toBe(
      "!¡ᔑリℸ ̣⍑ᒷ∷ᔑ ℸ ̣╎⊣∷╎ᓭ"
    );
    expect(toStandardGalactic("Acropora spp.")).toBe("ᔑᓵ∷𝙹!¡𝙹∷ᔑ ᓭ!¡!¡.");
  });
});
