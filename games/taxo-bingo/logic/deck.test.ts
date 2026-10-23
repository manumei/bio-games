import { describe, expect, it } from "vitest";
import { ORGANISMS, getOrganism } from "@/data/organisms";
import {
  createDeck,
  currentOrganismId,
  preloadImageUrls,
  removeCurrent,
  skipCurrent,
} from "@/games/taxo-bingo/logic/deck";
import { createRng } from "@/lib/rng";

describe("games/taxo-bingo/logic/deck", () => {
  it("never exhausts the deck or category members when skipping N > deck.size times", () => {
    const rng = createRng(101);
    const allIds = ORGANISMS.map((o) => o.id);
    let deck = createDeck(allIds, rng);

    for (let i = 0; i < 650; i++) {
      const cur = currentOrganismId(deck);
      expect(cur).toBeDefined();
      expect(cur).not.toBeNull();
      deck = skipCurrent(deck, rng);
    }

    expect(deck.ids).toHaveLength(ORGANISMS.length);
    const nematodaLeft = deck.ids.filter((id) =>
      getOrganism(id).path.includes("nematoda")
    );
    expect(nematodaLeft.length).toBe(7);
  });

  it("removes only placed organisms via removeCurrent", () => {
    const rng = createRng(202);
    const ids = ORGANISMS.slice(0, 5).map((o) => o.id);
    let deck = createDeck(ids, rng);
    const first = currentOrganismId(deck)!;

    deck = removeCurrent(deck, rng);
    expect(deck.ids).toHaveLength(4);
    expect(deck.ids).not.toContain(first);
    expect(currentOrganismId(deck)).not.toBe(first);
  });

  it("returns upcoming preload image URLs without duplicates", () => {
    const rng = createRng(303);
    const ids = ORGANISMS.slice(0, 10).map((o) => o.id);
    const deck = createDeck(ids, rng);
    const urls = preloadImageUrls(deck, 4);

    expect(urls).toHaveLength(4);
    expect(new Set(urls).size).toBe(4);
    for (const url of urls) {
      expect(url.startsWith("/assets/webp/games/taxo/")).toBe(true);
    }
  });
});
