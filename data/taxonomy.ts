export type TaxonRank = "domain" | "kingdom" | "phylum" | "class" | "order";
export type TaxonId = string;

export interface Taxon {
  id: TaxonId;
  label: string;
  rank: TaxonRank;
  parent: TaxonId | null;
  emoji: string;
  description: string;
}

export const TAXONOMY: readonly Taxon[] = [
  {
    id: "bacteria",
    label: "Bacteria",
    rank: "domain",
    parent: null,
    emoji: "🦠",
    description: "Single-celled prokaryotes without a nucleus",
  },
  {
    id: "eukaryota",
    label: "Eukaryota",
    rank: "domain",
    parent: null,
    emoji: "🔬",
    description: "Organisms with complex cells containing a nucleus",
  },
  {
    id: "animalia",
    label: "Animalia",
    rank: "kingdom",
    parent: "eukaryota",
    emoji: "🐾",
    description: "Multicellular, heterotrophic organisms with no cell walls",
  },
  {
    id: "plantae",
    label: "Plantae",
    rank: "kingdom",
    parent: "eukaryota",
    emoji: "🌿",
    description: "Multicellular autotrophs that perform photosynthesis",
  },
  {
    id: "fungi",
    label: "Fungi",
    rank: "kingdom",
    parent: "eukaryota",
    emoji: "🍄",
    description:
      "Heterotrophic eukaryotes with chitin cell walls, often decomposers",
  },
  {
    // Note: Protista is an informal paraphyletic kingdom grouping in this dataset
    id: "protista",
    label: "Protista",
    rank: "kingdom",
    parent: "eukaryota",
    emoji: "🧫",
    description: "Diverse group of mostly unicellular eukaryotes",
  },
  {
    id: "porifera",
    label: "Porifera",
    rank: "phylum",
    parent: "animalia",
    emoji: "🧽",
    description: "The sponges, simple aquatic animals with porous bodies",
  },
  {
    id: "cnidaria",
    label: "Cnidaria",
    rank: "phylum",
    parent: "animalia",
    emoji: "🪼",
    description:
      "Aquatic animals with stinging cells like jellyfish and corals",
  },
  {
    id: "platyhelminthes",
    label: "Platyhelminthes",
    rank: "phylum",
    parent: "animalia",
    emoji: "💩",
    description: "Flatworms with bilateral symmetry and no body cavity",
  },
  {
    id: "nematoda",
    label: "Nematoda",
    rank: "phylum",
    parent: "animalia",
    emoji: "〰️",
    description:
      "Roundworms with tubular bodies and complete digestive tracts",
  },
  {
    id: "annelida",
    label: "Annelida",
    rank: "phylum",
    parent: "animalia",
    emoji: "🪱",
    description: "Segmented worms like earthworms and leeches",
  },
  {
    id: "chordata",
    label: "Chordata",
    rank: "phylum",
    parent: "animalia",
    emoji: "🦴",
    description:
      "Animals with a notochord at some stage (includes vertebrates!)",
  },
  {
    id: "arthropoda",
    label: "Arthropoda",
    rank: "phylum",
    parent: "animalia",
    emoji: "🐜",
    description: "Invertebrates with exoskeletons and jointed limbs",
  },
  {
    id: "echinodermata",
    label: "Echinodermata",
    rank: "phylum",
    parent: "animalia",
    emoji: "⭐",
    description: "Marine invertebrates like starfish with radial symmetry",
  },
  {
    id: "mollusca",
    label: "Mollusca",
    rank: "phylum",
    parent: "animalia",
    emoji: "🐚",
    description:
      "Soft-bodied invertebrates often with shells like snails and octopuses",
  },
  {
    id: "bryophyta",
    label: "Bryophyta",
    rank: "phylum",
    parent: "plantae",
    emoji: "🌱",
    description: "Non-vascular plants like mosses that reproduce via spores",
  },
  {
    id: "pteridophyta",
    label: "Pteridophyta",
    rank: "phylum",
    parent: "plantae",
    emoji: "🌿",
    description: "Vascular seedless plants like ferns",
  },
  {
    id: "gymnospermae",
    label: "Gymnospermae",
    rank: "phylum",
    parent: "plantae",
    emoji: "🌲",
    description: "Seed-producing plants with naked seeds, like conifers",
  },
  {
    id: "angiospermae",
    label: "Angiospermae",
    rank: "phylum",
    parent: "plantae",
    emoji: "🌻",
    description: "Flowering plants with seeds enclosed in fruit",
  },
  {
    id: "mammalia",
    label: "Mammalia",
    rank: "class",
    parent: "chordata",
    emoji: "🐘",
    description: "Warm-blooded vertebrates with hair and mammary glands",
  },
  {
    // Note: Aves sits directly under Chordata in this dataset
    id: "aves",
    label: "Aves",
    rank: "class",
    parent: "chordata",
    emoji: "🐦",
    description: "Warm-blooded vertebrates with feathers and beaks—birds",
  },
  {
    id: "reptilia",
    label: "Reptilia",
    rank: "class",
    parent: "chordata",
    emoji: "🐍",
    description:
      "Cold-blooded vertebrates with scales and eggs with leathery shells",
  },
  {
    id: "amphibia",
    label: "Amphibia",
    rank: "class",
    parent: "chordata",
    emoji: "🐸",
    description:
      "Vertebrates with dual life stages, aquatic larvae and terrestrial adults",
  },
  {
    id: "chondrichthyes",
    label: "Chondrichthyes",
    rank: "class",
    parent: "chordata",
    emoji: "🦈",
    description: "Cartilaginous fishes like sharks and rays",
  },
  {
    id: "osteichthyes",
    label: "Osteichthyes",
    rank: "class",
    parent: "chordata",
    emoji: "🐠",
    description: "Bony fishes, the largest class of vertebrates",
  },
  {
    id: "arachnida",
    label: "Arachnida",
    rank: "class",
    parent: "arthropoda",
    emoji: "🕷️",
    description: "Eight-legged arthropods like spiders, scorpions, and ticks",
  },
  {
    id: "insecta",
    label: "Insecta",
    rank: "class",
    parent: "arthropoda",
    emoji: "🐞",
    description: "Six-legged arthropods with three-part bodies and often wings",
  },
  {
    id: "crustacea",
    label: "Crustacea",
    rank: "class",
    parent: "arthropoda",
    emoji: "🦀",
    description: "Mostly aquatic arthropods like crabs, shrimp, and lobsters",
  },
  {
    id: "myriapoda",
    label: "Myriapoda",
    rank: "class",
    parent: "arthropoda",
    emoji: "🪳",
    description: "Arthropods with many legs like centipedes and millipedes",
  },
  {
    id: "araneae",
    label: "Araneae",
    rank: "order",
    parent: "arachnida",
    emoji: "🕸️",
    description: "The true spiders, known for silk-spinning and venomous bites",
  },
  {
    id: "scorpiones",
    label: "Scorpiones",
    rank: "order",
    parent: "arachnida",
    emoji: "🦂",
    description: "Scorpions, arachnids with pincers and venomous stingers",
  },
  {
    id: "acari",
    label: "Acari",
    rank: "order",
    parent: "arachnida",
    emoji: "🐜",
    description:
      "Mites and ticks, small arachnids often parasitic or decomposers",
  },
  {
    id: "coleoptera",
    label: "Coleoptera",
    rank: "order",
    parent: "insecta",
    emoji: "🪲",
    description:
      "The beetles, the largest order of animals with hardened forewings",
  },
  {
    id: "lepidoptera",
    label: "Lepidoptera",
    rank: "order",
    parent: "insecta",
    emoji: "🦋",
    description: "Insects with scaled wings—moths and butterflies",
  },
  {
    id: "diptera",
    label: "Diptera",
    rank: "order",
    parent: "insecta",
    emoji: "🪰",
    description: "Flies and mosquitoes, insects with a single pair of wings",
  },
  {
    id: "hymenoptera",
    label: "Hymenoptera",
    rank: "order",
    parent: "insecta",
    emoji: "🐝",
    description: "Ants, bees, and wasps, often eusocial and with stingers",
  },
  {
    id: "hemiptera",
    label: "Hemiptera",
    rank: "order",
    parent: "insecta",
    emoji: "🪳",
    description: "True bugs with piercing-sucking mouthparts",
  },
  {
    id: "dictyoptera",
    label: "Dictyoptera",
    rank: "order",
    parent: "insecta",
    emoji: "🪳",
    description: "Roaches and mantises, with leathery wings and egg cases",
  },
  {
    id: "squamata",
    label: "Squamata",
    rank: "order",
    parent: "reptilia",
    emoji: "🦎",
    description: "Lizards and snakes, reptiles with scaly skin and flexible jaws",
  },
  {
    id: "testudines",
    label: "Testudines",
    rank: "order",
    parent: "reptilia",
    emoji: "🐢",
    description: "Turtles and tortoises, reptiles with hard shells",
  },
  {
    id: "crocodilia",
    label: "Crocodilia",
    rank: "order",
    parent: "reptilia",
    emoji: "🐊",
    description: "Crocodiles, alligators, and relatives with powerful jaws",
  },
  {
    id: "primates",
    label: "Primates",
    rank: "order",
    parent: "mammalia",
    emoji: "🐒",
    description: "Mammals with grasping hands and complex social behavior",
  },
  {
    id: "carnivora",
    label: "Carnivora",
    rank: "order",
    parent: "mammalia",
    emoji: "🦁",
    description: "Flesh-eating mammals like cats, dogs, and bears",
  },
  {
    id: "rodentia",
    label: "Rodentia",
    rank: "order",
    parent: "mammalia",
    emoji: "🐭",
    description:
      "Mammals with ever-growing incisors like mice and squirrels",
  },
  {
    id: "artiodactyla",
    label: "Artiodactyla",
    rank: "order",
    parent: "mammalia",
    emoji: "🐗",
    description: "Even-toed hoofed mammals like deer and pigs",
  },
  {
    id: "perissodactyla",
    label: "Perissodactyla",
    rank: "order",
    parent: "mammalia",
    emoji: "🦓",
    description: "Odd-toed hoofed mammals like horses and rhinos",
  },
  {
    id: "chiroptera",
    label: "Chiroptera",
    rank: "order",
    parent: "mammalia",
    emoji: "🦇",
    description: "The bats, the only mammals capable of sustained flight",
  },
  {
    id: "cetacea",
    label: "Cetacea",
    rank: "order",
    parent: "mammalia",
    emoji: "🐬",
    description:
      "Aquatic mammals like whales and dolphins with streamlined bodies",
  },
  {
    id: "marsupialia",
    label: "Marsupialia",
    rank: "order",
    parent: "mammalia",
    emoji: "🦘",
    description: "Mammals with pouches like kangaroos and koalas",
  },
  {
    id: "pilosa",
    label: "Pilosa",
    rank: "order",
    parent: "mammalia",
    emoji: "🦥",
    description:
      "Sloths and anteaters, mammals with slow movement and long tongues",
  },
  {
    id: "ascomycota",
    label: "Ascomycota",
    rank: "phylum",
    parent: "fungi",
    emoji: "🧫",
    description:
      "Sac fungi producing spores in asci, like yeasts, morels, truffles, and penicillium",
  },
  {
    id: "basidiomycota",
    label: "Basidiomycota",
    rank: "phylum",
    parent: "fungi",
    emoji: "🍄",
    description:
      "Club fungi producing spores on basidia, including gilled mushrooms and puffballs",
  },
  {
    id: "cephalopoda",
    label: "Cephalopoda",
    rank: "class",
    parent: "mollusca",
    emoji: "🐙",
    description:
      "Marine mollusks with tentacles and bilateral symmetry, like octopuses, squids, and nautiluses",
  },
  {
    id: "gastropoda",
    label: "Gastropoda",
    rank: "class",
    parent: "mollusca",
    emoji: "🐌",
    description:
      "Mollusks with a muscular foot, like snails and slugs, often with coiled shells",
  },
  {
    id: "bivalvia",
    label: "Bivalvia",
    rank: "class",
    parent: "mollusca",
    emoji: "🦪",
    description:
      "Aquatic mollusks enclosed by a two-part hinged shell, like clams, oysters, and mussels",
  },
  {
    id: "asteroidea",
    label: "Asteroidea",
    rank: "class",
    parent: "echinodermata",
    emoji: "⭐",
    description:
      "Star-shaped marine echinoderms known as sea stars or starfish",
  },
  {
    id: "echinoidea",
    label: "Echinoidea",
    rank: "class",
    parent: "echinodermata",
    emoji: "🦔",
    description:
      "Spiny, globular or flattened echinoderms like sea urchins and sand dollars",
  },
  {
    id: "anthozoa",
    label: "Anthozoa",
    rank: "class",
    parent: "cnidaria",
    emoji: "🪸",
    description:
      "Exclusively marine polyp cnidarians with no medusa stage, including corals and sea anemones",
  },
  {
    id: "scyphozoa",
    label: "Scyphozoa",
    rank: "class",
    parent: "cnidaria",
    emoji: "🪼",
    description:
      "The true jellyfish, pulsating cup-shaped marine cnidarians with stinging tentacles",
  },
  {
    id: "anura",
    label: "Anura",
    rank: "order",
    parent: "amphibia",
    emoji: "🐸",
    description:
      "Tailless amphibians with elongated hind legs adapted for jumping—frogs and toads",
  },
  {
    id: "caudata",
    label: "Caudata",
    rank: "order",
    parent: "amphibia",
    emoji: "🦎",
    description:
      "Tailed amphibians with slender bodies, short limbs, and aquatic larvae—salamanders and newts",
  },
  {
    id: "passeriformes",
    label: "Passeriformes",
    rank: "order",
    parent: "aves",
    emoji: "🐦",
    description:
      "Perching birds and songbirds, the largest order of birds with three forward toes and one back",
  },
  {
    id: "anseriformes",
    label: "Anseriformes",
    rank: "order",
    parent: "aves",
    emoji: "🦆",
    description:
      "Waterfowl like ducks, geese, and swans adapted for swimming with webbed feet",
  },
  {
    id: "falconiformes",
    label: "Falconiformes",
    rank: "order",
    parent: "aves",
    emoji: "🦅",
    description:
      "Diurnal raptors like falcons and caracaras with hooked beaks and sharp talons",
  },
  {
    id: "strigiformes",
    label: "Strigiformes",
    rank: "order",
    parent: "aves",
    emoji: "🦉",
    description:
      "Nocturnal birds of prey with forward-facing facial discs, silent flight, and keen hearing—owls",
  },
  {
    id: "sphenisciformes",
    label: "Sphenisciformes",
    rank: "order",
    parent: "aves",
    emoji: "🐧",
    description:
      "Flightless aquatic birds with dense waterproof feathers and flipper wings—penguins",
  },
  {
    id: "lagomorpha",
    label: "Lagomorpha",
    rank: "order",
    parent: "mammalia",
    emoji: "🐇",
    description:
      "Herbivorous mammals with four upper incisors and continuous enamel, like rabbits, hares, and pikas",
  },
  {
    id: "proboscidea",
    label: "Proboscidea",
    rank: "order",
    parent: "mammalia",
    emoji: "🐘",
    description:
      "Large mammals with elongated muscular trunks, columnar legs, and tusks—elephants",
  },
  {
    id: "perciformes",
    label: "Perciformes",
    rank: "order",
    parent: "osteichthyes",
    emoji: "🐠",
    description:
      "Perch-like ray-finned fishes, a huge order including cichlids, clownfish, perch, and tuna",
  },
  {
    id: "salmoniformes",
    label: "Salmoniformes",
    rank: "order",
    parent: "osteichthyes",
    emoji: "🐟",
    description:
      "Ray-finned fishes with an adipose fin and sleek bodies, including salmon and trout",
  },
  {
    id: "selachimorpha",
    label: "Selachimorpha",
    rank: "order",
    parent: "chondrichthyes",
    emoji: "🦈",
    description:
      "Cartilaginous predatory fish with multiple gill slits, placoid scales, and oil-filled livers—sharks",
  },
];

const TAXON_BY_ID = new Map<TaxonId, Taxon>(
  TAXONOMY.map((taxon) => [taxon.id, taxon])
);

export function getTaxon(id: TaxonId): Taxon {
  const taxon = TAXON_BY_ID.get(id.toLowerCase());
  if (!taxon) {
    throw new Error(`Unknown taxon id: "${id}"`);
  }
  return taxon;
}
