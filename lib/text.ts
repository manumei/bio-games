export interface Searchable {
  id: string;
  label: string;
  aliases?: readonly string[];
}

export interface PrefixSearchOptions {
  minChars?: number;
  limit?: number;
}

/**
 * Normalize text for case-, diacritic-, and punctuation-insensitive matching:
 * lowercase, trim, strip diacritics (NFD + remove \p{M}), "-" and "_" -> space,
 * drop other punctuation, collapse spaces.
 */
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsMatchesQueryInOrder(
  candidateWords: readonly string[],
  queryWords: readonly string[]
): { matched: boolean; firstMatchedIndex: number } {
  if (queryWords.length === 0) {
    return { matched: false, firstMatchedIndex: -1 };
  }

  let startIdx = 0;
  let firstMatchedIndex = -1;

  for (const qWord of queryWords) {
    let foundAt = -1;
    for (let i = startIdx; i < candidateWords.length; i++) {
      if (candidateWords[i]!.startsWith(qWord)) {
        foundAt = i;
        break;
      }
    }
    if (foundAt === -1) {
      return { matched: false, firstMatchedIndex: -1 };
    }
    if (firstMatchedIndex === -1) {
      firstMatchedIndex = foundAt;
    }
    startIdx = foundAt + 1;
  }

  return { matched: true, firstMatchedIndex };
}

/**
 * Prefix search over label and aliases.
 * Matches when ANY whitespace-separated word of the label or of an alias starts with the normalized query
 * (for multi-word queries, every query word must prefix-match some word, in order).
 * Ranking:
 *   0: label starts with query
 *   1: first word of label matches
 *   2: alias starts with or matches query
 *   3: other word of label matches
 * Ties broken alphabetically by label.
 */
export function prefixSearch<T extends Searchable>(
  items: readonly T[],
  query: string,
  opts?: PrefixSearchOptions
): T[] {
  const minChars = opts?.minChars ?? 3;
  const limit = opts?.limit ?? 8;
  const normQuery = normalizeText(query);

  if (normQuery.length < minChars) {
    return [];
  }

  const queryWords = normQuery.split(" ").filter(Boolean);
  const scored: { item: T; rank: number; normLabel: string }[] = [];

  for (const item of items) {
    const normLabel = normalizeText(item.label);
    const labelWords = normLabel.split(" ").filter(Boolean);
    const labelMatch = wordsMatchesQueryInOrder(labelWords, queryWords);

    let bestRank: number | null = null;

    if (normLabel.startsWith(normQuery)) {
      bestRank = 0;
    } else if (labelMatch.matched && labelMatch.firstMatchedIndex === 0) {
      bestRank = 1;
    } else if (labelMatch.matched) {
      bestRank = 3;
    }

    if (bestRank === null || bestRank > 2) {
      const aliases = item.aliases ?? [];
      for (const alias of aliases) {
        const normAlias = normalizeText(alias);
        const aliasWords = normAlias.split(" ").filter(Boolean);
        const aliasMatch = wordsMatchesQueryInOrder(aliasWords, queryWords);
        if (normAlias.startsWith(normQuery) || aliasMatch.matched) {
          bestRank = bestRank === null ? 2 : Math.min(bestRank, 2);
          break;
        }
      }
    }

    if (bestRank !== null) {
      scored.push({ item, rank: bestRank, normLabel });
    }
  }

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.item.label.localeCompare(b.item.label);
  });

  return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Exact normalized match against item.label or any item.aliases entry.
 */
export function findExact<T extends Searchable>(
  items: readonly T[],
  input: string
): T | null {
  const normInput = normalizeText(input);
  if (!normInput) return null;

  for (const item of items) {
    if (normalizeText(item.label) === normInput) {
      return item;
    }
    if (item.aliases) {
      for (const alias of item.aliases) {
        if (normalizeText(alias) === normInput) {
          return item;
        }
      }
    }
  }
  return null;
}

