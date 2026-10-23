import { getOrganism } from "@/data/organisms";
import type { DeckState } from "@/games/taxo-bingo/types";
import { shuffle, type Rng } from "@/lib/rng";

/**
 * Create a shuffled deck of organism IDs starting at cursor 0.
 */
export function createDeck(
  organismIds: readonly string[],
  rng: Rng
): DeckState {
  return {
    ids: shuffle(organismIds, rng),
    cursor: 0,
  };
}

/**
 * Return the organism ID at the current deck cursor, or null if the deck is empty.
 */
export function currentOrganismId(deck: DeckState): string | null {
  if (deck.ids.length === 0) return null;
  return deck.ids[deck.cursor] ?? deck.ids[0] ?? null;
}

/**
 * Advance past the current organism (recycling it into the deck).
 * When reaching the end of the pass, reshuffles the deck for the next pass.
 */
export function skipCurrent(deck: DeckState, rng: Rng): DeckState {
  const len = deck.ids.length;
  if (len <= 1) {
    return { ids: deck.ids, cursor: 0 };
  }

  const nextCursor = deck.cursor + 1;
  if (nextCursor < len) {
    return {
      ids: deck.ids,
      cursor: nextCursor,
    };
  }

  const currentId = deck.ids[deck.cursor];
  const reshuffled = shuffle(deck.ids, rng);
  // Avoid immediately repeating the last organism across a pass boundary when possible
  if (reshuffled.length > 1 && reshuffled[0] === currentId) {
    const swapIdx = 1;
    const swapped = [...reshuffled];
    const first = swapped[0]!;
    swapped[0] = swapped[swapIdx]!;
    swapped[swapIdx] = first;
    return { ids: swapped, cursor: 0 };
  }

  return {
    ids: reshuffled,
    cursor: 0,
  };
}

/**
 * Permanently remove the placed organism at the cursor and advance.
 */
export function removeCurrent(deck: DeckState, rng: Rng): DeckState {
  const len = deck.ids.length;
  if (len === 0) return deck;

  const nextIds = [
    ...deck.ids.slice(0, deck.cursor),
    ...deck.ids.slice(deck.cursor + 1),
  ];

  if (nextIds.length === 0) {
    return { ids: [], cursor: 0 };
  }

  if (deck.cursor < nextIds.length) {
    return {
      ids: nextIds,
      cursor: deck.cursor,
    };
  }

  return {
    ids: shuffle(nextIds, rng),
    cursor: 0,
  };
}

/**
 * Return up to n upcoming organism image URLs after the current cursor.
 */
export function preloadImageUrls(deck: DeckState, n: number): string[] {
  const len = deck.ids.length;
  if (len <= 1 || n <= 0) return [];

  const count = Math.min(n, len - 1);
  const urls: string[] = [];
  for (let offset = 1; offset <= count; offset++) {
    const id = deck.ids[(deck.cursor + offset) % len];
    if (id) {
      urls.push(getOrganism(id).image);
    }
  }
  return urls;
}
