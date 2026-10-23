export const MAX_GUESSES = 6;
export const WORD_LENGTHS = [4, 5, 6, 7] as const;
export type WordLength = (typeof WORD_LENGTHS)[number];

export const HINT_AFTER = 3;
export const SHAKE_MS = 600;
export const REVEAL_STEP_MS = 250;

export type Topic =
  | "cell"
  | "molecule"
  | "genetics"
  | "anatomy"
  | "organism"
  | "plant"
  | "disease"
  | "ecology";

export interface TopicInfo {
  emoji: string;
  label: string;
}

export const TOPICS: Readonly<Record<Topic, TopicInfo>> = {
  cell: { emoji: "🧫", label: "Cell biology" },
  molecule: { emoji: "🧪", label: "Molecules" },
  genetics: { emoji: "🧬", label: "Genetics" },
  anatomy: { emoji: "🫀", label: "Anatomy" },
  organism: { emoji: "🐾", label: "Organisms" },
  plant: { emoji: "🌿", label: "Plants" },
  disease: { emoji: "🦠", label: "Disease" },
  ecology: { emoji: "🌍", label: "Ecology & evolution" },
};
