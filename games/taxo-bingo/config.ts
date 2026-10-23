import type { TaxonId } from "@/data/taxonomy";

export const TIMER_OPTIONS = [null, 120, 180] as const;
export type TimerOption = (typeof TIMER_OPTIONS)[number];

export const DEFAULT_TIMER: TimerOption = 180;
export const HARD_MODE_TIMER: TimerOption = 120;

export const DOMAIN_SLOT: readonly TaxonId[] = ["bacteria", "eukaryota"];
export const KINGDOM_SLOT: readonly TaxonId[] = [
  "animalia",
  "plantae",
  "chordata",
  "arthropoda",
];
export const ALWAYS_INCLUDED_TAXON: TaxonId = "angiospermae";

export const RANDOM_POOL_TAXA: readonly TaxonId[] = [
  // Phyla of Animalia & small kingdoms
  "porifera",
  "cnidaria",
  "platyhelminthes",
  "nematoda",
  "annelida",
  "fungi",
  "protista",
  "echinodermata",
  "mollusca",
  // Phyla of Plantae (excluding angiospermae)
  "bryophyta",
  "pteridophyta",
  "gymnospermae",
  // Classes of Chordata
  "mammalia",
  "aves",
  "reptilia",
  "amphibia",
  "chondrichthyes",
  "osteichthyes",
  // Classes of Arthropoda
  "arachnida",
  "insecta",
  "crustacea",
  "myriapoda",
  // Orders of Arachnida
  "araneae",
  "scorpiones",
  "acari",
  // Orders of Insecta
  "coleoptera",
  "lepidoptera",
  "diptera",
  "hymenoptera",
  "hemiptera",
  "dictyoptera",
  // Orders of Reptilia
  "squamata",
  "testudines",
  "crocodilia",
  // Orders of Mammalia
  "primates",
  "carnivora",
  "rodentia",
  "artiodactyla",
  "perissodactyla",
  "chiroptera",
  "cetacea",
  "marsupialia",
  "pilosa",
  "lagomorpha",
  "proboscidea",
  // Orders of Amphibia
  "anura",
  "caudata",
  // Orders of Aves
  "passeriformes",
  "anseriformes",
  "falconiformes",
  "strigiformes",
  "sphenisciformes",
  // Classes of Mollusca
  "cephalopoda",
  "gastropoda",
  "bivalvia",
  // Classes of Echinodermata
  "asteroidea",
  "echinoidea",
  // Classes of Cnidaria
  "anthozoa",
  "scyphozoa",
  // Phyla of Fungi
  "ascomycota",
  "basidiomycota",
  // Orders of Fishes
  "perciformes",
  "salmoniformes",
  "selachimorpha",
];

export const RANDOM_POOL_PICK_COUNT = 9;
export const GRID_SIZE = 1 + 1 + 1 + RANDOM_POOL_PICK_COUNT;
export const PRELOAD_COUNT = 4;
export const SHAKE_MS = 700;
export const MIN_ORGANISMS_PER_CATEGORY = 5;

export function resolveTimerForHardMode(
  currentTimer: TimerOption,
  hardMode: boolean
): TimerOption {
  return hardMode ? HARD_MODE_TIMER : currentTimer;
}
