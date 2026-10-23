import type { CellType } from "./data/parts";

export const ROUND_SIZE = 10;
export const PASS_SCORE = 8;

export const NORMAL_CELL_TYPES: readonly CellType[] = ["animal", "plant"];
export const HARD_CELL_TYPES: readonly CellType[] = [
  "animal",
  "plant",
  "bacteria",
];

export const NORMAL_MAX_DIFFICULTY = 2;
export const HARD_MAX_DIFFICULTY = 3;

export const CELL_LABELS: Readonly<Record<CellType, string>> = {
  animal: "Animal Cell",
  plant: "Plant Cell",
  bacteria: "Bacterial Cell",
};

