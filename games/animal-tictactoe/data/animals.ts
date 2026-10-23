import rawAnimals from "./animals.json";

export interface Animal {
  id: string;
  name: string;
  aliases: string[];
  scientificName?: string;
  image?: string;
  traits: string[];
}

export interface SearchableAnimal extends Animal {
  label: string;
}

export const ANIMALS: readonly SearchableAnimal[] = (
  rawAnimals as Animal[]
).map((a) => ({
  ...a,
  label: a.name,
}));

const ANIMAL_BY_ID = new Map<string, SearchableAnimal>(
  ANIMALS.map((a) => [a.id, a]),
);

export function getAnimal(id: string): SearchableAnimal {
  const animal = ANIMAL_BY_ID.get(id);
  if (!animal) {
    throw new Error(`Unknown animal id: "${id}"`);
  }
  return animal;
}

export function toSearchableAnimals(
  animals: readonly Animal[],
): readonly SearchableAnimal[] {
  return animals.map((a) =>
    "label" in a && typeof a.label === "string"
      ? (a as SearchableAnimal)
      : { ...a, label: a.name },
  );
}
