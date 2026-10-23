export interface FallbackGrid {
  rows: [string, string, string];
  cols: [string, string, string];
}

export const FALLBACK_GRIDS: readonly FallbackGrid[] = [
  {
    rows: ["mammal", "bird", "reptile"],
    cols: ["carnivorous", "herbivore", "africa"],
  },
  {
    rows: ["africa", "asia", "north_america"],
    cols: ["mammal", "bird", "carnivorous"],
  },
  {
    rows: ["lives_in_ocean", "rainforest", "savanna"],
    cols: ["carnivorous", "lives_in_groups", "lays_eggs"],
  },
  {
    rows: ["mammal", "insect", "fish"],
    cols: ["carnivorous", "lives_in_groups", "north_america"],
  },
  {
    rows: ["nocturnal", "lives_in_groups", "apex_predator"],
    cols: ["mammal", "bird", "africa"],
  },
];

