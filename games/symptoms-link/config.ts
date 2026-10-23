export const MAX_STAGE = 5;
export const HINT_STAGE = 3;

export type DiseaseCategory =
  | "viral"
  | "bacterial"
  | "parasitic"
  | "fungal"
  | "genetic"
  | "autoimmune"
  | "metabolic"
  | "cardiovascular"
  | "respiratory"
  | "neurological"
  | "nutritional"
  | "oncological"
  | "other";

export interface CategoryInfo {
  emoji: string;
  label: string;
}

export const DISEASE_CATEGORIES: Readonly<
  Record<DiseaseCategory, CategoryInfo>
> = {
  viral: { emoji: "🧬", label: "Viral infection" },
  bacterial: { emoji: "🦠", label: "Bacterial infection" },
  parasitic: { emoji: "🪱", label: "Parasitic disease" },
  fungal: { emoji: "🍄", label: "Fungal infection" },
  genetic: { emoji: "🧬", label: "Genetic disorder" },
  autoimmune: { emoji: "🛡️", label: "Autoimmune disorder" },
  metabolic: { emoji: "⚗️", label: "Metabolic / endocrine" },
  cardiovascular: { emoji: "🫀", label: "Cardiovascular condition" },
  respiratory: { emoji: "🫁", label: "Respiratory condition" },
  neurological: { emoji: "🧠", label: "Neurological disorder" },
  nutritional: { emoji: "🍋", label: "Nutritional deficiency" },
  oncological: { emoji: "🎗️", label: "Neoplasm / Cancer" },
  other: { emoji: "🏥", label: "Clinical condition" },
};

