import type { TaxonId } from "@/data/taxonomy";
import {
  ALWAYS_INCLUDED_TAXON,
  DOMAIN_SLOT,
  KINGDOM_SLOT,
  RANDOM_POOL_PICK_COUNT,
  RANDOM_POOL_TAXA,
} from "@/games/taxo-bingo/config";
import { pick, sample, shuffle, type Rng } from "@/lib/rng";

/**
 * Generate the 12 taxonomic category IDs for a Taxo Bingo board:
 * - 1 domain (bacteria | eukaryota)
 * - 1 from the big kingdom/phylum slot (animalia | plantae | chordata | arthropoda)
 * - angiospermae (always included)
 * - 9 unique categories sampled from the remaining pool
 * Shuffled into random board positions via Fisher-Yates.
 */
export function generateGrid(rng: Rng): TaxonId[] {
  const domain = pick(DOMAIN_SLOT, rng);
  const kingdomOrPhylum = pick(KINGDOM_SLOT, rng);
  const randomNine = sample(RANDOM_POOL_TAXA, RANDOM_POOL_PICK_COUNT, rng);

  const combined: TaxonId[] = [
    domain,
    kingdomOrPhylum,
    ALWAYS_INCLUDED_TAXON,
    ...randomNine,
  ];

  return shuffle(combined, rng);
}
