import { describe, expect, it } from "vitest";
import { findExact, normalizeText, prefixSearch, type Searchable } from "@/lib/text";

describe("lib/text", () => {
  const items: Searchable[] = [
    { id: "red_panda", label: "Red Panda", aliases: ["Lesser Panda"] },
    { id: "giant_panda", label: "Giant Panda", aliases: ["Panda Bear"] },
    { id: "panther", label: "Panther", aliases: ["Black Panther"] },
    { id: "tuberculosis", label: "Tuberculosis", aliases: ["TB", "Consumption"] },
    { id: "sjogren", label: "Sjögren's Syndrome", aliases: ["Sjogren_syndrome"] },
  ];

  it("normalizes diacritics, hyphens, underscores, punctuation, and case", () => {
    expect(normalizeText("  Sjögren's_Syndrome-Test! ")).toBe(
      "sjogrens syndrome test"
    );
  });

  it("searches word prefixes across labels and aliases and ranks label-prefix first", () => {
    // "pan" -> Panther (starts with pan, rank 0) before Giant Panda and Red Panda (other word matches, rank 3)
    const results = prefixSearch(items, "pan");
    expect(results.map((r) => r.id)).toEqual([
      "panther",
      "giant_panda",
      "red_panda",
    ]);

    // Fewer than minChars (default 3) returns empty
    expect(prefixSearch(items, "pa")).toEqual([]);

    // Multi-word prefix search in order
    expect(prefixSearch(items, "red pan").map((r) => r.id)).toEqual([
      "red_panda",
    ]);

    // Alias prefix search
    expect(prefixSearch(items, "lesser").map((r) => r.id)).toEqual([
      "red_panda",
    ]);
  });

  it("finds exact normalized matches by label or alias", () => {
    expect(findExact(items, "tb")?.id).toBe("tuberculosis");
    expect(findExact(items, "Sjogren's syndrome")?.id).toBe("sjogren");
    expect(findExact(items, "unknown")?.id).toBeUndefined();
  });
});
