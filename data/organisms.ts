import rawOrganisms from "@/data/organisms.json";
import type { TaxonId } from "@/data/taxonomy";

export interface Organism {
  id: string;
  name: string;
  path: TaxonId[];
  image: string;
}

export const ORGANISMS: readonly Organism[] = rawOrganisms as Organism[];

const ORGANISM_BY_ID = new Map<string, Organism>(
  ORGANISMS.map((org) => [org.id, org])
);

export function getOrganism(id: string): Organism {
  const org = ORGANISM_BY_ID.get(id);
  if (!org) {
    throw new Error(`Unknown organism id: "${id}"`);
  }
  return org;
}

export function organismsInTaxon(taxonId: TaxonId): Organism[] {
  const normalized = taxonId.toLowerCase();
  return ORGANISMS.filter((org) => org.path.includes(normalized));
}
