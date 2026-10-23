import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/text";
import { MIN_ANSWERS } from "../config";
import { resolveAnimalImage } from "../logic/images";
import { ANIMALS, getAnimal } from "./animals";
import { FALLBACK_GRIDS } from "./fallbackGrids";
import { TRAITS, getTrait } from "./traits";

describe("ANIMALS dataset invariants", () => {
  it("contains at least 200 animals", () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(200);
  });

  it("has unique snake_case ids, unique names, and non-colliding aliases", () => {
    const ids = new Set<string>();
    const normalizedToAnimalId = new Map<string, string>();
    for (const animal of ANIMALS) {
      expect(animal.id).toMatch(/^[a-z0-9_]+$/);
      expect(ids.has(animal.id), `duplicate id ${animal.id}`).toBe(false);
      ids.add(animal.id);

      const normName = normalizeText(animal.name);
      expect(
        normalizedToAnimalId.has(normName),
        `name "${animal.name}" (${animal.id}) collides with ${normalizedToAnimalId.get(normName)}`,
      ).toBe(false);
      normalizedToAnimalId.set(normName, animal.id);

      for (const alias of animal.aliases) {
        const normAlias = normalizeText(alias);
        const existing = normalizedToAnimalId.get(normAlias);
        if (existing && existing !== animal.id) {
          throw new Error(
            `alias "${alias}" on ${animal.id} collides with ${existing}`,
          );
        }
        normalizedToAnimalId.set(normAlias, animal.id);
      }

      expect(getAnimal(animal.id)).toBe(animal);
    }
  });

  it("resolves only existing image files on disk", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    for (const animal of ANIMALS) {
      const imgPath = resolveAnimalImage(animal);
      if (imgPath !== null) {
        const diskPath = path.join(publicDir, imgPath);
        expect(
          fs.existsSync(diskPath),
          `${animal.id} resolved image missing: ${diskPath}`,
        ).toBe(true);
      }
    }
  });

  it("references only valid trait IDs from TRAITS", () => {
    const validTraitIds = new Set(TRAITS.map((t) => t.id));
    for (const animal of ANIMALS) {
      expect(animal.traits.length).toBeGreaterThan(0);
      for (const traitId of animal.traits) {
        expect(
          validTraitIds.has(traitId),
          `${animal.id} has unknown trait "${traitId}"`,
        ).toBe(true);
      }
    }
  });

  it("assigns every animal exactly one class trait and one diet trait", () => {
    const classIds = new Set(
      TRAITS.filter((t) => t.group === "class").map((t) => t.id),
    );
    const dietIds = new Set(
      TRAITS.filter((t) => t.group === "diet").map((t) => t.id),
    );

    for (const animal of ANIMALS) {
      const animalClasses = animal.traits.filter((t) => classIds.has(t));
      const animalDiets = animal.traits.filter((t) => dietIds.has(t));
      expect(
        animalClasses,
        `${animal.id} classes: ${animalClasses.join(", ")}`,
      ).toHaveLength(1);
      expect(
        animalDiets,
        `${animal.id} diets: ${animalDiets.join(", ")}`,
      ).toHaveLength(1);
    }
  });

  it("has at least 6 matching animals for every trait in TRAITS", () => {
    for (const trait of TRAITS) {
      const count = ANIMALS.filter((a) => a.traits.includes(trait.id)).length;
      expect(
        count,
        `trait "${trait.id}" only matches ${count} animals (minimum 6)`,
      ).toBeGreaterThanOrEqual(6);
    }
  });

  it("has valid solvable fallback grids", () => {
    expect(FALLBACK_GRIDS).toHaveLength(5);
    for (const grid of FALLBACK_GRIDS) {
      const allSix = [...grid.rows, ...grid.cols];
      expect(new Set(allSix).size).toBe(6);
      for (const r of grid.rows) {
        const rTrait = getTrait(r);
        for (const c of grid.cols) {
          const cTrait = getTrait(c);
          expect(
            rTrait.exclusive && cTrait.exclusive && rTrait.group === cTrait.group,
          ).toBeFalsy();
          const matching = ANIMALS.filter(
            (a) => a.traits.includes(r) && a.traits.includes(c),
          );
          expect(
            matching.length,
            `fallback cell (${r}, ${c}) has ${matching.length} matches`,
          ).toBeGreaterThanOrEqual(MIN_ANSWERS);
        }
      }
    }
  });
});
