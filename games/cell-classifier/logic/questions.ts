import { pick, shuffle, type Rng } from "@/lib/rng";
import {
  HARD_CELL_TYPES,
  HARD_MAX_DIFFICULTY,
  NORMAL_CELL_TYPES,
  NORMAL_MAX_DIFFICULTY,
  ROUND_SIZE,
} from "../config";
import {
  PARTS,
  getPart,
  partsForCell,
  type CellPart,
  type CellType,
} from "../data/parts";

export type QuestionType = "name" | "find" | "classify";

export interface CellQuestion {
  type: QuestionType;
  cell: CellType;
  partId: string;
  options: string[];
  cluePartIds?: [string, string, string];
}

const ALL_CELL_TYPES: readonly CellType[] = ["animal", "plant", "bacteria"];

/**
 * Returns the unique CellType that contains all given partIds, or null if 0 or >1 cells match.
 */
export function resolveUniqueCellForParts(
  partIds: readonly string[],
  catalog: readonly CellPart[] = PARTS,
): CellType | null {
  if (partIds.length === 0) return null;
  const partMap = new Map<string, CellPart>(catalog.map((p) => [p.id, p]));
  const parts = partIds.map((id) => partMap.get(id));
  if (parts.some((p) => !p)) return null;

  const matchingCells = ALL_CELL_TYPES.filter((cell) =>
    (parts as CellPart[]).every((p) => p.cells.includes(cell)),
  );

  return matchingCells.length === 1 ? matchingCells[0] : null;
}

/**
 * Generates a "Which cell is it?" question with 3 structures whose intersection uniquely identifies `targetCell`.
 */
export function generateClassifyQuestion(
  rng: Rng,
  allowedCells: readonly CellType[] = ALL_CELL_TYPES,
  maxDifficulty: 1 | 2 | 3 = 3,
): CellQuestion {
  const targetCell = pick(allowedCells, rng);
  const cellParts = shuffle(partsForCell(targetCell, maxDifficulty), rng);

  for (let i = 0; i < cellParts.length; i++) {
    for (let j = i + 1; j < cellParts.length; j++) {
      for (let k = j + 1; k < cellParts.length; k++) {
        const trio: [string, string, string] = [
          cellParts[i].id,
          cellParts[j].id,
          cellParts[k].id,
        ];
        if (resolveUniqueCellForParts(trio) === targetCell) {
          const orderedTrio = shuffle(trio, rng) as [string, string, string];
          // Ensure partId is a diagnostic structure exclusive to targetCell when possible
          const diagnostic =
            trio.find((id) => getPart(id).cells.length === 1) ?? orderedTrio[0];
          return {
            type: "classify",
            cell: targetCell,
            partId: diagnostic,
            options: ["animal", "plant", "bacteria"],
            cluePartIds: orderedTrio,
          };
        }
      }
    }
  }

  // Fallback guaranteed unique trios
  const fallbackByCell: Record<CellType, [string, string, string]> = {
    animal: ["lysosome", "nucleus", "mitochondrion"],
    plant: ["chloroplast", "central_vacuole", "cell_wall"],
    bacteria: ["nucleoid", "plasmid", "flagellum"],
  };
  const trio = fallbackByCell[targetCell];
  return {
    type: "classify",
    cell: targetCell,
    partId: trio[0],
    options: ["animal", "plant", "bacteria"],
    cluePartIds: trio,
  };
}

export function buildChoicesForPart(
  cell: CellType,
  correctPartId: string,
  rng: Rng,
): string[] {
  const correctPart = getPart(correctPartId);
  const candidates = PARTS.filter(
    (p) => p.cells.includes(cell) && p.id !== correctPartId,
  );
  const shuffled = shuffle(candidates, rng);
  // Prefer similar difficulty first
  shuffled.sort(
    (a, b) =>
      Math.abs(a.difficulty - correctPart.difficulty) -
      Math.abs(b.difficulty - correctPart.difficulty),
  );
  const distractors = shuffled.slice(0, 3).map((p) => p.id);
  return shuffle([correctPartId, ...distractors], rng);
}

export interface GenerateRoundOptions {
  includeClassify?: boolean;
}

export function generateRound(
  rng: Rng,
  hardMode: boolean,
  opts?: GenerateRoundOptions,
): CellQuestion[] {
  const includeClassify = opts?.includeClassify ?? true;
  const allowedCells = hardMode ? HARD_CELL_TYPES : NORMAL_CELL_TYPES;
  const maxDiff = hardMode ? HARD_MAX_DIFFICULTY : NORMAL_MAX_DIFFICULTY;

  const classifyCount = includeClassify ? 1 : 0;
  const coreCount = ROUND_SIZE - classifyCount;
  const nameCount = Math.ceil(coreCount / 2); // 5
  const findCount = coreCount - nameCount; // 4 (or 5 if classifyCount === 0)

  // Build candidate (cell, partId) pairs
  const candidatePairs: { cell: CellType; part: CellPart }[] = [];
  for (const cell of allowedCells) {
    for (const part of partsForCell(cell, maxDiff)) {
      candidatePairs.push({ cell, part });
    }
  }

  const shuffledPairs = shuffle(candidatePairs, rng);
  const selectedPairs: { cell: CellType; part: CellPart }[] = [];
  const usedPairKey = new Set<string>();
  const partCounts = new Map<string, number>();
  const cellCounts = new Map<CellType, number>(
    allowedCells.map((c) => [c, 0]),
  );

  // First pass: ensure every allowed cell type gets balanced representation
  while (selectedPairs.length < coreCount) {
    // Pick the cell type with the fewest questions so far
    const sortedCells = [...allowedCells].sort(
      (a, b) => (cellCounts.get(a) ?? 0) - (cellCounts.get(b) ?? 0),
    );
    let added = false;
    for (const targetCell of sortedCells) {
      const candidate = shuffledPairs.find((pair) => {
        if (pair.cell !== targetCell) return false;
        const key = `${pair.cell}:${pair.part.id}`;
        if (usedPairKey.has(key)) return false;
        if ((partCounts.get(pair.part.id) ?? 0) >= 2) return false;
        return true;
      });
      if (candidate) {
        const key = `${candidate.cell}:${candidate.part.id}`;
        usedPairKey.add(key);
        partCounts.set(
          candidate.part.id,
          (partCounts.get(candidate.part.id) ?? 0) + 1,
        );
        cellCounts.set(
          candidate.cell,
          (cellCounts.get(candidate.cell) ?? 0) + 1,
        );
        selectedPairs.push(candidate);
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  const typesPool: ("name" | "find")[] = shuffle(
    [
      ...Array<"name">(nameCount).fill("name"),
      ...Array<"find">(findCount).fill("find"),
    ],
    rng,
  );

  const questions: CellQuestion[] = selectedPairs.map((pair, idx) => {
    const qType = typesPool[idx] ?? "name";
    const options =
      qType === "name"
        ? buildChoicesForPart(pair.cell, pair.part.id, rng)
        : [];
    return {
      type: qType,
      cell: pair.cell,
      partId: pair.part.id,
      options,
    };
  });

  if (classifyCount > 0) {
    const classifyQ = generateClassifyQuestion(rng, allowedCells, maxDiff);
    questions.push(classifyQ);
  }

  return shuffle(questions, rng);
}

