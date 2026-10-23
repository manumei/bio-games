import { organismsInTaxon, type Organism } from "@/data/organisms";
import type { TaxonId } from "@/data/taxonomy";
import { createRng, pick } from "@/lib/rng";

/**
 * Pick one deterministic example organism for each unfilled cell on the grid.
 */
export function revealExamples(
  gridIds: readonly TaxonId[],
  placements: Readonly<Record<TaxonId, string>>,
  seed: number | string
): Record<TaxonId, Organism> {
  const revealed: Record<TaxonId, Organism> = {};
  for (const id of gridIds) {
    if (placements[id]) continue;
    const candidates = organismsInTaxon(id);
    if (candidates.length > 0) {
      revealed[id] = pick(candidates, createRng(`${seed}${id}`));
    }
  }
  return revealed;
}

