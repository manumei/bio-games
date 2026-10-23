import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ORGANISMS,
  getOrganism,
  organismsInTaxon,
} from "@/data/organisms";
import { TAXONOMY, getTaxon } from "@/data/taxonomy";

const PUBLIC_DIR = path.resolve(import.meta.dirname, "../public");
const MIN_ORGANISMS_PER_CATEGORY = 5;

describe("data integrity", () => {
  it("contains unique organisms with valid accessors", () => {
    expect(ORGANISMS.length).toBeGreaterThanOrEqual(546);
    const ids = new Set(ORGANISMS.map((o) => o.id));
    expect(ids.size).toBe(ORGANISMS.length);
    for (const org of ORGANISMS) {
      expect(getOrganism(org.id)).toBe(org);
    }
  });

  it("ensures every organism image path is absolute and exists under public/", () => {
    for (const org of ORGANISMS) {
      expect(org.image.startsWith("/assets/")).toBe(true);
      const diskPath = path.join(PUBLIC_DIR, org.image.slice(1));
      expect(
        fs.existsSync(diskPath),
        `Missing image on disk for ${org.id}: ${org.image}`
      ).toBe(true);
    }
  });

  it("ensures every organism path segment is a known taxon in TAXONOMY", () => {
    expect(TAXONOMY.length).toBeGreaterThanOrEqual(50);
    for (const org of ORGANISMS) {
      expect(org.path.length).toBeGreaterThan(0);
      for (const taxonId of org.path) {
        expect(() => getTaxon(taxonId)).not.toThrow();
      }
    }
  });

  it("ensures every taxon in the catalog has at least MIN_ORGANISMS_PER_CATEGORY organisms", () => {
    for (const taxon of TAXONOMY) {
      const members = organismsInTaxon(taxon.id);
      expect(
        members.length,
        `Taxon ${taxon.id} has only ${members.length} organisms`
      ).toBeGreaterThanOrEqual(MIN_ORGANISMS_PER_CATEGORY);
    }
  });
});
