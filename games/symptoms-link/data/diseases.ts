import type { DiseaseCategory } from "@/games/symptoms-link/config";
import rawDiseases from "@/games/symptoms-link/data/diseases.json";

export interface OrganismLink {
  label: string;
  organismId?: string;
}

export interface Disease {
  id: string;
  name: string;
  aliases: string[];
  category: DiseaseCategory;
  emoji: string;
  symptoms: [string, string, string, string, string];
  cause?: OrganismLink;
  vector?: OrganismLink;
  fact: string;
  difficulty: 1 | 2 | 3;
  icon?: string;
}

export const DISEASES: readonly Disease[] = rawDiseases as Disease[];

const DISEASE_BY_ID = new Map<string, Disease>(
  DISEASES.map((d) => [d.id, d])
);

export function getDisease(id: string): Disease {
  const found = DISEASE_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown disease id: "${id}"`);
  }
  return found;
}
