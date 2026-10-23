export type TraitGroup =
  | "class"
  | "diet"
  | "habitat"
  | "continent"
  | "body"
  | "behavior";

export interface Trait {
  id: string;
  label: string;
  emoji: string;
  group: TraitGroup;
  description: string;
  exclusive?: boolean;
  implies?: string[];
}

export const TRAITS: readonly Trait[] = [
  // ==================== CLASS (exclusive) ====================
  {
    id: "mammal",
    label: "Mammal",
    emoji: "🐾",
    group: "class",
    description:
      "Vertebrate of class Mammalia with hair/fur and milk-producing mammary glands.",
    exclusive: true,
    implies: ["warm_blooded"],
  },
  {
    id: "bird",
    label: "Bird",
    emoji: "🐦",
    group: "class",
    description:
      "Feathered, beaked vertebrate of class Aves that lays hard-shelled eggs.",
    exclusive: true,
    implies: ["warm_blooded", "lays_eggs"],
  },
  {
    id: "reptile",
    label: "Reptile",
    emoji: "🦎",
    group: "class",
    description:
      "Cold-blooded air-breathing vertebrate with dry scales or scutes (lizards, snakes, turtles, crocodilians).",
    exclusive: true,
    implies: ["lays_eggs"],
  },
  {
    id: "amphibian",
    label: "Amphibian",
    emoji: "🐸",
    group: "class",
    description:
      "Cold-blooded vertebrate with moist permeable skin and aquatic larval stage (frogs, toads, salamanders).",
    exclusive: true,
    implies: ["lays_eggs"],
  },
  {
    id: "fish",
    label: "Fish",
    emoji: "🐟",
    group: "class",
    description:
      "Gill-bearing aquatic vertebrate with fins (includes both bony fishes and cartilaginous sharks/rays).",
    exclusive: true,
  },
  {
    id: "insect",
    label: "Insect",
    emoji: "🐞",
    group: "class",
    description:
      "Six-legged arthropod of class Insecta with a three-part body (head, thorax, abdomen).",
    exclusive: true,
    implies: ["lays_eggs"],
  },
  {
    id: "arachnid",
    label: "Arachnid",
    emoji: "🕷️",
    group: "class",
    description:
      "Eight-legged arthropod of class Arachnida (spiders, scorpions, ticks, and mites).",
    exclusive: true,
    implies: ["lays_eggs"],
  },
  {
    id: "crustacean",
    label: "Crustacean",
    emoji: "🦀",
    group: "class",
    description:
      "Arthropod of subphylum Crustacea with a hard carapace and two pairs of antennae (crabs, lobsters, shrimp).",
    exclusive: true,
    implies: ["lays_eggs", "has_shell"],
  },
  {
    id: "mollusk",
    label: "Mollusk",
    emoji: "🐚",
    group: "class",
    description:
      "Soft-bodied invertebrate of phylum Mollusca (snails, clams, octopuses, squids).",
    exclusive: true,
    implies: ["lays_eggs"],
  },

  // ==================== DIET (exclusive) ====================
  {
    id: "carnivorous",
    label: "Carnivore",
    emoji: "🥩",
    group: "diet",
    description:
      "Mostly eats other animals (vertebrates or invertebrates) as its primary food source.",
    exclusive: true,
  },
  {
    id: "herbivore",
    label: "Herbivore",
    emoji: "🌿",
    group: "diet",
    description:
      "Mostly eats plant material, nectar, sap, seeds, fruits, or algae.",
    exclusive: true,
  },
  {
    id: "omnivore",
    label: "Omnivore",
    emoji: "🍽️",
    group: "diet",
    description:
      "Regularly eats a substantial mix of both plant matter and animal prey.",
    exclusive: true,
  },

  // ==================== HABITAT ====================
  {
    id: "lives_in_ocean",
    label: "Lives in the ocean",
    emoji: "🌊",
    group: "habitat",
    description:
      "Spends most or all of its life in marine saltwater habitats.",
  },
  {
    id: "freshwater",
    label: "Freshwater",
    emoji: "🏞️",
    group: "habitat",
    description:
      "Lives in or depends closely on rivers, lakes, ponds, or freshwater wetlands.",
  },
  {
    id: "desert",
    label: "Desert",
    emoji: "🏜️",
    group: "habitat",
    description:
      "Adapted to live in arid deserts or dry scrublands with scarce rainfall.",
  },
  {
    id: "rainforest",
    label: "Rainforest",
    emoji: "🌴",
    group: "habitat",
    description:
      "Inhabits tropical or temperate rainforests with dense tree canopy.",
  },
  {
    id: "lives_in_tundra",
    label: "Lives in tundra / Arctic",
    emoji: "❄️",
    group: "habitat",
    description:
      "Lives in polar, Arctic, Antarctic, or alpine tundra habitats.",
  },
  {
    id: "savanna",
    label: "Savanna / Grassland",
    emoji: "🦒",
    group: "habitat",
    description:
      "Inhabits open savannas, prairies, steppes, or grasslands.",
  },
  {
    id: "mountains",
    label: "Mountains",
    emoji: "⛰️",
    group: "habitat",
    description:
      "Inhabits high-elevation mountain ranges, cliffs, or montane forests.",
  },

  // ==================== CONTINENT (native range) ====================
  {
    id: "africa",
    label: "Native to Africa",
    emoji: "🌍",
    group: "continent",
    description: "Naturally occurs in wild habitats of the African continent.",
  },
  {
    id: "asia",
    label: "Native to Asia",
    emoji: "🌏",
    group: "continent",
    description: "Naturally occurs in wild habitats of the Asian continent.",
  },
  {
    id: "australia",
    label: "Australia / Oceania",
    emoji: "🦘",
    group: "continent",
    description:
      "Naturally occurs in Australia, New Guinea, New Zealand, or surrounding Oceania.",
  },
  {
    id: "south_america",
    label: "South America",
    emoji: "🦜",
    group: "continent",
    description:
      "Naturally occurs in wild habitats of Central or South America.",
  },
  {
    id: "north_america",
    label: "North America",
    emoji: "🦅",
    group: "continent",
    description:
      "Naturally occurs in wild habitats of North America.",
  },
  {
    id: "europe",
    label: "Native to Europe",
    emoji: "🏰",
    group: "continent",
    description: "Naturally occurs in wild habitats of Europe.",
  },

  // ==================== BODY ====================
  {
    id: "warm_blooded",
    label: "Warm-blooded",
    emoji: "🌡️",
    group: "body",
    description:
      "Endothermic animal (mammal or bird) that maintains a constant internal body temperature.",
  },
  {
    id: "lays_eggs",
    label: "Lays eggs",
    emoji: "🥚",
    group: "body",
    description:
      "Oviparous species whose females lay eggs that hatch outside the mother's body.",
  },
  {
    id: "venomous",
    label: "Venomous",
    emoji: "☠️",
    group: "body",
    description:
      "Actively injects venom via fangs, stingers, chelicerae, barbs, or spurs (poisonous-to-eat does not count).",
  },
  {
    id: "can_fly",
    label: "Can fly",
    emoji: "🪽",
    group: "body",
    description:
      "Capable of powered flight using wings (gliding alone does not count).",
  },
  {
    id: "has_shell",
    label: "Has a shell",
    emoji: "🐢",
    group: "body",
    description:
      "Bears an external calcareous shell or bony carapace (turtles, tortoises, shelled mollusks, crustaceans).",
  },

  // ==================== BEHAVIOR ====================
  {
    id: "nocturnal",
    label: "Nocturnal",
    emoji: "🌙",
    group: "behavior",
    description:
      "Primarily active, hunting, or foraging at night and resting during the day.",
  },
  {
    id: "apex_predator",
    label: "Apex predator",
    emoji: "👑",
    group: "behavior",
    description:
      "Top predator at the peak of its food chain whose healthy adults have no natural predators.",
    implies: ["carnivorous"],
  },
  {
    id: "hibernates",
    label: "Hibernates",
    emoji: "💤",
    group: "behavior",
    description:
      "Enters seasonal hibernation, brumation, or prolonged winter torpor.",
  },
  {
    id: "migrates",
    label: "Migrates",
    emoji: "🧭",
    group: "behavior",
    description:
      "Undertakes regular seasonal long-distance migrations between regions.",
  },
  {
    id: "lives_in_groups",
    label: "Lives in groups",
    emoji: "👥",
    group: "behavior",
    description:
      "Social species that lives in herds, packs, prides, pods, flocks, schools, or eusocial colonies.",
  },
];

const TRAIT_BY_ID = new Map<string, Trait>(TRAITS.map((t) => [t.id, t]));

export function getTrait(id: string): Trait {
  const trait = TRAIT_BY_ID.get(id);
  if (!trait) {
    throw new Error(`Unknown trait id: "${id}"`);
  }
  return trait;
}

