"use client";

interface Props {
  onClose: () => void;
}

const categoriesDict: { [key: string]: string } = {
  "Bacteria 🦠": "Single-celled prokaryotes without a nucleus",
  "Eukaryota 🔬": "Organisms with complex cells containing a nucleus",
  "Animalia 🐾": "Multicellular, heterotrophic organisms with no cell walls",
  "Plantae 🌿": "Multicellular autotrophs that perform photosynthesis",
  "Fungi 🍄":
    "Heterotrophic eukaryotes with chitin cell walls, often decomposers",
  "Protista 🧫": "Diverse group of mostly unicellular eukaryotes",
  "Porifera 🧽": "The sponges, simple aquatic animals with porous bodies",
  "Cnidaria 🪼": "Aquatic animals with stinging cells like jellyfish and corals",
  "Platyhelminthes 💩": "Flatworms with bilateral symmetry and no body cavity",
  "Nematoda 〰️": "Roundworms with tubular bodies and complete digestive tracts",
  "Annelida 🪱": "Segmented worms like earthworms and leeches",
  "Chordata 🦴":
    "Animals with a notochord at some stage (includes vertebrates!)",
  "Arthropoda 🐜": "Invertebrates with exoskeletons and jointed limbs",
  "Echinodermata ⭐": "Marine invertebrates like starfish with radial symmetry",
  "Mollusca 🐚":
    "Soft-bodied invertebrates often with shells like snails and octopuses",
  "Bryophyta 🌱": "Non-vascular plants like mosses that reproduce via spores",
  "Pteridophyta 🌿": "Vascular seedless plants like ferns",
  "Gymnospermae 🌲": "Seed-producing plants with naked seeds, like conifers",
  "Angiospermae 🌻": "Flowering plants with seeds enclosed in fruit",
  "Mammalia 🐘": "Warm-blooded vertebrates with hair and mammary glands",
  "Aves 🐦": "Warm-blooded vertebrates with feathers and beaks—birds",
  "Reptilia 🐍":
    "Cold-blooded vertebrates with scales and eggs with leathery shells",
  "Amphibia 🐸":
    "Vertebrates with dual life stages, aquatic larvae and terrestrial adults",
  "Chondrichthyes 🦈": "Cartilaginous fishes like sharks and rays",
  "Osteichthyes 🐠": "Bony fishes, the largest class of vertebrates",
  "Arachnida 🕷️": "Eight-legged arthropods like spiders, scorpions, and ticks",
  "Insecta 🐞": "Six-legged arthropods with three-part bodies and often wings",
  "Crustacea 🦀": "Mostly aquatic arthropods like crabs, shrimp, and lobsters",
  "Myriapoda 🪳": "Arthropods with many legs like centipedes and millipedes",
  "Araneae 🕸️": "The true spiders, known for silk-spinning and venomous bites",
  "Scorpiones 🦂": "Scorpions, arachnids with pincers and venomous stingers",
  "Acari 🐜": "Mites and ticks, small arachnids often parasitic or decomposers",
  "Coleoptera 🪲":
    "The beetles, the largest order of animals with hardened forewings",
  "Lepidoptera 🦋": "Insects with scaled wings—moths and butterflies",
  "Diptera 🪰": "Flies and mosquitoes, insects with a single pair of wings",
  "Hymenoptera 🐝": "Ants, bees, and wasps, often eusocial and with stingers",
  "Hemiptera 🪳": "True bugs with piercing-sucking mouthparts",
  "Dictyoptera 🪳": "Roaches and mantises, with leathery wings and egg cases",
  "Squamata 🦎":
    "Lizards and snakes, reptiles with scaly skin and flexible jaws",
  "Testudines 🐢": "Turtles and tortoises, reptiles with hard shells",
  "Crocodilia 🐊": "Crocodiles, alligators, and relatives with powerful jaws",
  "Primates 🐒": "Mammals with grasping hands and complex social behavior",
  "Carnivora 🦁": "Flesh-eating mammals like cats, dogs, and bears",
  "Rodentia 🐭": "Mammals with ever-growing incisors like mice and squirrels",
  "Artiodactyla 🐗": "Even-toed hoofed mammals like deer and pigs",
  "Perissodactyla 🦓": "Odd-toed hoofed mammals like horses and rhinos",
  "Chiroptera 🦇": "The bats, the only mammals capable of sustained flight",
  "Cetacea 🐬":
    "Aquatic mammals like whales and dolphins with streamlined bodies",
  "Marsupialia 🦘": "Mammals with pouches like kangaroos and koalas",
  "Pilosa 🦥":
    "Sloths and anteaters, mammals with slow movement and long tongues",
};

export default function CheatSheet({ onClose }: Props) {
  return (
    <>
      {/* Overlay to block background interactions */}
      <div onClick={onClose} className="fixed inset-0 bg-[#0000004f] z-[999]" />

      {/* Cheat Sheet Panel */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto max-w-[80vw] md:max-w-[45rem] w-full max-h-[70vh]
        bg-[rgb(241,234,234)] text-black p-6 rounded-lg shadow-lg overflow-y-auto z-[1000]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-red-600 text-2xl sm:text-3xl hover:text-red-800 transition cursor-pointer"
          title="Close"
        >
          ✖
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Taxo Cheat Sheet</h2>
        <ul className="text-sm md:text-base leading-relaxed space-y-2">
          {Object.entries(categoriesDict).map(([category, desc]) => (
            <li key={category}>
              <strong>{category}</strong>: {desc}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
