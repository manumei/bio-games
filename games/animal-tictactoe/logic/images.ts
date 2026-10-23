import { ORGANISMS, getOrganism } from "@/data/organisms";
import type { Animal } from "../data/animals";

const ORGANISM_ID_SET = new Set<string>(ORGANISMS.map((org) => org.id));
const ORGANISM_BY_NAME = new Map<string, string>(
  ORGANISMS.map((org) => [org.name.toLowerCase(), org.id]),
);

export function resolveAnimalImage(animal: Animal): string | null {
  if (animal.image) {
    return `/assets/webp/games/animal-tictactoe/${animal.image}`;
  }
  if (animal.scientificName) {
    const orgId = animal.scientificName.toLowerCase().replace(/\s+/g, "_");
    if (ORGANISM_ID_SET.has(orgId)) {
      return getOrganism(orgId).image;
    }
    const fallbackId = ORGANISM_BY_NAME.get(
      animal.scientificName.toLowerCase(),
    );
    if (fallbackId) {
      return getOrganism(fallbackId).image;
    }
  }
  return null;
}
