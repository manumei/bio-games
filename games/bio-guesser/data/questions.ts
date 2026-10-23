import { TAXONOMY, type TaxonId } from "@/data/taxonomy";

export interface TaxonQuestion {
  id: string;
  taxonId: TaxonId;
  text: string;
}

const QUESTION_TEXT_BY_TAXON: Readonly<Record<string, string>> = {
  bacteria: "Is it a bacterium?",
  animalia: "Is it an animal?",
  plantae: "Is it a plant?",
  fungi: "Is it a fungus, like a mushroom, mold, or yeast?",
  protista:
    "Is it a protist? (a mostly single-celled eukaryote like an amoeba, or a seaweed/alga)",
  porifera: "Is it a sea sponge (an aquatic animal with a porous body)?",
  cnidaria:
    "Does it have stinging tentacles, like a jellyfish, sea anemone, or coral?",
  platyhelminthes: "Is it a flatworm, like a tapeworm or planarian?",
  nematoda: "Is it a roundworm (nematode)?",
  annelida: "Is it a segmented worm, like an earthworm or leech?",
  chordata:
    "Does it have a backbone or spinal cord (is it a vertebrate)?",
  arthropoda:
    "Does it have an exoskeleton and jointed legs (like an insect, spider, or crab)?",
  echinodermata:
    "Is it a spiny-skinned marine animal with radial symmetry, like a starfish or sea urchin?",
  mollusca:
    "Is it a soft-bodied mollusk, like a snail, clam, octopus, or squid?",
  bryophyta: "Is it a non-vascular spore plant like a moss?",
  pteridophyta:
    "Is it a vascular seedless plant with fronds, like a fern?",
  gymnospermae:
    "Does it produce seeds in cones rather than flowers, like a conifer or pine tree?",
  angiospermae:
    "Is it a flowering plant with seeds enclosed in fruit or flowers?",
  mammalia:
    "Is it a mammal (warm-blooded, with fur/hair and produces milk)?",
  aves: "Is it a bird (feathered, beaked, and lays hard-shelled eggs)?",
  reptilia:
    "Is it a reptile (cold-blooded with dry scales or scutes, like a lizard, snake, or turtle)?",
  amphibia:
    "Is it an amphibian (like a frog, toad, or salamander with moist skin)?",
  chondrichthyes:
    "Is it a cartilaginous fish with a skeleton of cartilage, like a shark or ray?",
  osteichthyes: "Is it a bony fish with fins, scales, and gills?",
  arachnida: "Does it have eight legs, like a spider, scorpion, or tick?",
  insecta:
    "Is it a six-legged insect with a three-part body, and often wings?",
  crustacea:
    "Is it a crustacean, like a crab, lobster, shrimp, or barnacle?",
  myriapoda:
    "Does it have many pairs of legs, like a centipede or millipede?",
  araneae: "Is it a true spider that spins silk webs?",
  scorpiones:
    "Is it a scorpion with grasping pincers and a venomous tail stinger?",
  acari: "Is it a tiny arachnid like a tick or mite?",
  coleoptera:
    "Is it a beetle with hard protective wing covers (elytra)?",
  lepidoptera:
    "Does it have powdery, scaled wings, like a butterfly or moth?",
  diptera:
    "Is it a true fly or mosquito with only a single pair of functional wings?",
  hymenoptera: "Is it an ant, bee, or wasp?",
  hemiptera:
    "Is it a 'true bug' with piercing-sucking mouthparts, like a cicada or shield bug?",
  dictyoptera: "Is it a cockroach, praying mantis, or termite?",
  squamata: "Is it a lizard or a snake?",
  testudines: "Is it a turtle or tortoise with a bony shell?",
  crocodilia:
    "Is it a crocodilian, like an alligator, crocodile, or caiman?",
  primates:
    "Is it a primate with grasping hands and forward-facing eyes, like a monkey, ape, or human?",
  carnivora:
    "Is it a carnivoran mammal with sharp claws and teeth, like a cat, dog, bear, seal, or hyena?",
  rodentia:
    "Is it a rodent with gnawing chisel-like front teeth, like a mouse, rat, beaver, or squirrel?",
  artiodactyla:
    "Is it an even-toed hoofed mammal, like a deer, cow, pig, sheep, hippo, or camel?",
  perissodactyla:
    "Is it an odd-toed hoofed mammal, like a horse, zebra, or rhino?",
  chiroptera:
    "Is it a bat (a flying mammal with winged forelimbs)?",
  cetacea:
    "Is it a fully aquatic marine mammal, like a whale, dolphin, or porpoise?",
  marsupialia:
    "Does it carry and nurse its young in a pouch, like a kangaroo, koala, or opossum?",
  pilosa: "Is it an anteater or sloth?",
};

export const QUESTIONS: readonly TaxonQuestion[] = TAXONOMY.filter(
  (taxon) => taxon.id !== "eukaryota",
).map((taxon) => {
  const text =
    QUESTION_TEXT_BY_TAXON[taxon.id] ?? `Is it a member of ${taxon.label}?`;
  return {
    id: `is_${taxon.id}`,
    taxonId: taxon.id,
    text,
  };
});

const QUESTION_BY_ID = new Map<string, TaxonQuestion>(
  QUESTIONS.map((q) => [q.id, q]),
);

export function getQuestion(id: string): TaxonQuestion {
  const q = QUESTION_BY_ID.get(id);
  if (!q) {
    throw new Error(`Unknown question id: "${id}"`);
  }
  return q;
}

