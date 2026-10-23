import { randomInt, shuffle, type Rng } from "@/lib/rng";
import { MAX_SAME_GROUP, MIN_ANSWERS } from "../config";
import { ANIMALS, type Animal } from "../data/animals";
import { FALLBACK_GRIDS } from "../data/fallbackGrids";
import { TRAITS, type Trait } from "../data/traits";

export interface GeneratedGrid {
  rows: [string, string, string];
  cols: [string, string, string];
}

export function answersFor(
  rowId: string,
  colId: string,
  animals: readonly Animal[] = ANIMALS,
): Animal[] {
  return animals
    .filter((a) => a.traits.includes(rowId) && a.traits.includes(colId))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

function areTraitsCompatible(r: Trait, c: Trait): boolean {
  if (r.id === c.id) return false;
  if (r.exclusive && c.exclusive && r.group === c.group) return false;
  if (r.implies?.includes(c.id)) return false;
  if (c.implies?.includes(r.id)) return false;
  return true;
}

function withinGroupLimit(traits: readonly Trait[]): boolean {
  const counts = new Map<string, number>();
  for (const t of traits) {
    const next = (counts.get(t.group) ?? 0) + 1;
    if (next > MAX_SAME_GROUP) return false;
    counts.set(t.group, next);
  }
  return true;
}

export function hasDistinctNineSolution(
  rows: readonly [string, string, string],
  cols: readonly [string, string, string],
  animals: readonly Animal[] = ANIMALS,
): boolean {
  const candidatesPerCell: string[][] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const matches = answersFor(rows[r], cols[c], animals).map((a) => a.id);
      if (matches.length === 0) return false;
      candidatesPerCell.push(matches);
    }
  }

  // Sort cells by fewest candidates first (MRV heuristic) for instant backtracking
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(
    (a, b) => candidatesPerCell[a].length - candidatesPerCell[b].length,
  );

  const used = new Set<string>();
  function backtrack(idx: number): boolean {
    if (idx === 9) return true;
    const cellIdx = order[idx];
    for (const animalId of candidatesPerCell[cellIdx]) {
      if (!used.has(animalId)) {
        used.add(animalId);
        if (backtrack(idx + 1)) return true;
        used.delete(animalId);
      }
    }
    return false;
  }

  return backtrack(0);
}

export function isValidGrid(
  rows: readonly [string, string, string],
  cols: readonly [string, string, string],
  animals: readonly Animal[] = ANIMALS,
  traits: readonly Trait[] = TRAITS,
  minAnswers: number = MIN_ANSWERS,
): boolean {
  const allIds = [...rows, ...cols];
  if (new Set(allIds).size !== 6) return false;

  const traitMap = new Map<string, Trait>(traits.map((t) => [t.id, t]));
  const rowTraits = rows.map((id) => traitMap.get(id));
  const colTraits = cols.map((id) => traitMap.get(id));
  if (rowTraits.some((t) => !t) || colTraits.some((t) => !t)) return false;

  const sixTraits = [...(rowTraits as Trait[]), ...(colTraits as Trait[])];
  if (!withinGroupLimit(sixTraits)) return false;

  for (const r of rowTraits as Trait[]) {
    for (const c of colTraits as Trait[]) {
      if (!areTraitsCompatible(r, c)) return false;
      if (answersFor(r.id, c.id, animals).length < minAnswers) return false;
    }
  }

  return hasDistinctNineSolution(rows, cols, animals);
}

export function generateGrid(
  rng: Rng,
  animals: readonly Animal[] = ANIMALS,
  traits: readonly Trait[] = TRAITS,
  maxAttempts = 1000,
): GeneratedGrid {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pool = shuffle(traits, rng);
    const rowTraits: Trait[] = [];
    for (const t of pool) {
      if (withinGroupLimit([...rowTraits, t])) {
        rowTraits.push(t);
        if (rowTraits.length === 3) break;
      }
    }
    if (rowTraits.length < 3) continue;

    const rowIds = new Set(rowTraits.map((t) => t.id));
    const colCandidates = pool.filter(
      (c) =>
        !rowIds.has(c.id) &&
        rowTraits.every(
          (r) =>
            areTraitsCompatible(r, c) &&
            answersFor(r.id, c.id, animals).length >= MIN_ANSWERS,
        ),
    );
    if (colCandidates.length < 3) continue;

    const colTraits: Trait[] = [];
    for (const c of colCandidates) {
      if (withinGroupLimit([...rowTraits, ...colTraits, c])) {
        colTraits.push(c);
        if (colTraits.length === 3) break;
      }
    }
    if (colTraits.length < 3) continue;

    const rows: [string, string, string] = [
      rowTraits[0].id,
      rowTraits[1].id,
      rowTraits[2].id,
    ];
    const cols: [string, string, string] = [
      colTraits[0].id,
      colTraits[1].id,
      colTraits[2].id,
    ];

    if (hasDistinctNineSolution(rows, cols, animals)) {
      return { rows, cols };
    }
  }

  const fb = FALLBACK_GRIDS[randomInt(0, FALLBACK_GRIDS.length - 1, rng)];
  return {
    rows: [...fb.rows] as [string, string, string],
    cols: [...fb.cols] as [string, string, string],
  };
}

