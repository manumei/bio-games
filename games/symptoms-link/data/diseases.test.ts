import { describe, expect, it } from "vitest";
import { getOrganism } from "@/data/organisms";
import { DISEASE_CATEGORIES } from "@/games/symptoms-link/config";
import { DISEASES } from "@/games/symptoms-link/data/diseases";
import { normalizeText } from "@/lib/text";

describe("games/symptoms-link/data/diseases", () => {
  it("has at least 60 diseases with unique IDs and valid categories", () => {
    expect(DISEASES.length).toBeGreaterThanOrEqual(60);

    const ids = new Set<string>();
    for (const d of DISEASES) {
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
      expect(DISEASE_CATEGORIES[d.category]).toBeDefined();
      expect([1, 2, 3]).toContain(d.difficulty);
      expect(d.fact.length).toBeGreaterThan(15);
    }
  });

  it("ensures every disease has 5 symptoms <= 45 chars and none contains the disease name or an alias", () => {
    for (const d of DISEASES) {
      expect(d.symptoms).toHaveLength(5);
      const forbiddenTerms = [d.name, ...d.aliases]
        .map((t) => normalizeText(t))
        .filter((t) => t.length >= 3);

      for (const symptom of d.symptoms) {
        expect(
          symptom.length,
          `${d.id}: "${symptom}" (${symptom.length} chars) > 45`
        ).toBeLessThanOrEqual(45);
        const normSymptom = normalizeText(symptom);
        for (const term of forbiddenTerms) {
          expect(
            normSymptom.includes(term),
            `${d.id}: symptom "${symptom}" contains forbidden term "${term}"`
          ).toBe(false);
        }
      }
    }
  });

  it("verifies every organismId in cause/vector exists in ORGANISMS and aliases do not collide across diseases", () => {
    const seenNamesAndAliases = new Map<string, string>();

    for (const d of DISEASES) {
      if (d.cause?.organismId) {
        expect(() => getOrganism(d.cause!.organismId!)).not.toThrow();
      }
      if (d.vector?.organismId) {
        expect(() => getOrganism(d.vector!.organismId!)).not.toThrow();
      }

      for (const term of [d.name, ...d.aliases]) {
        const norm = normalizeText(term);
        const existingOwner = seenNamesAndAliases.get(norm);
        expect(
          existingOwner === undefined || existingOwner === d.id,
          `Collision on "${term}" between ${existingOwner} and ${d.id}`
        ).toBe(true);
        seenNamesAndAliases.set(norm, d.id);
      }
    }
  });
});
