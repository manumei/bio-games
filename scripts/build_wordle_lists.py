#!/usr/bin/env python3
"""
Build the curated Bio Wordle answer dataset (`games/bio-wordle/data/answers.json`),
the rejected raw-word audit log (`scripts/data/bio_words_rejected.txt`), and the
per-length allowed guess lists (`public/assets/data/wordle/allowed-{4,5,6,7}.txt`)
from the public-domain ENABLE word list (`enable1.txt`).
"""

from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_WORDS_PATH = ROOT / "scripts" / "data" / "bio_words_raw.txt"
REJECTED_PATH = ROOT / "scripts" / "data" / "bio_words_rejected.txt"
ANSWERS_JSON_PATH = ROOT / "games" / "bio-wordle" / "data" / "answers.json"
ALLOWED_DIR = ROOT / "public" / "assets" / "data" / "wordle"

ENABLE_URL = "https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt"

# Curated high-school / intro-college biology vocabulary (4-7 letters).
# Topics: "cell" | "molecule" | "genetics" | "anatomy" | "organism" | "plant" | "disease" | "ecology"
CURATED_ANSWERS: list[tuple[str, str, str]] = [
    # ==================== 4-LETTER ANSWERS (90) ====================
    ("cell", "cell", "The basic membrane-bound unit of all living organisms."),
    ("pore", "cell", "A tiny opening in a membrane or leaf surface that lets molecules pass."),
    ("soma", "cell", "The cell body of a neuron containing its nucleus and organelles."),
    ("axon", "cell", "Long nerve fiber that conducts electrical impulses away from the cell body."),
    ("glia", "cell", "Non-neuronal cells in nervous tissue that support and insulate neurons."),
    ("cyst", "cell", "Dormant protective capsule formed by some parasites and microbes."),
    ("ovum", "cell", "A mature female reproductive egg cell."),
    ("germ", "cell", "A microorganism or reproductive cell capable of developing into a new individual."),
    ("gene", "genetics", "A segment of DNA that encodes a functional protein or RNA product."),
    ("loci", "genetics", "Specific fixed chromosomal positions where particular genes are located."),
    ("twin", "genetics", "One of two offspring produced in the same pregnancy."),
    ("bred", "genetics", "Mated selectively to propagate specific heritable traits."),
    ("sire", "genetics", "The male parent of an animal."),
    ("agar", "molecule", "Gelatinous polysaccharide extracted from red algae used for culture media."),
    ("heme", "molecule", "Iron-containing porphyrin cofactor that binds oxygen in hemoglobin."),
    ("urea", "molecule", "Nitrogenous waste compound produced by protein metabolism in mammals."),
    ("acid", "molecule", "Compound that donates protons, such as amino, fatty, or nucleic acids."),
    ("base", "molecule", "Nitrogenous ring compound in DNA and RNA, or a proton acceptor."),
    ("ions", "molecule", "Charged atoms or molecules essential for nerve impulses and osmosis."),
    ("fats", "molecule", "Triglyceride lipids used by organisms for long-term energy storage."),
    ("oils", "molecule", "Liquid unsaturated lipids produced by plants and animals."),
    ("iron", "molecule", "Essential trace mineral required for oxygen transport in hemoglobin."),
    ("zinc", "molecule", "Essential trace metal acting as a catalytic cofactor in hundreds of enzymes."),
    ("salt", "molecule", "Ionic mineral compound vital for fluid balance and nerve signaling."),
    ("atp", "molecule", "Wait"),  # 3 letters - skip
    ("silk", "molecule", "Strong protein fiber spun by spiders and silkworm caterpillars."),
    ("milk", "molecule", "Nutrient-rich liquid secreted by the mammary glands of mammals."),
    ("bile", "anatomy", "Digestive fluid produced by the liver and stored in the gallbladder."),
    ("lung", "anatomy", "Spongy respiratory organ where gas exchange occurs in air-breathing vertebrates."),
    ("skin", "anatomy", "Outer integumentary organ that protects the body and regulates temperature."),
    ("bone", "anatomy", "Mineralized connective tissue that forms the vertebrate skeleton."),
    ("vein", "anatomy", "Blood vessel that carries blood back toward the heart."),
    ("iris", "anatomy", "Colored muscular ring of the eye that controls pupil size."),
    ("lens", "anatomy", "Transparent structure in the eye that focuses light onto the retina."),
    ("lobe", "anatomy", "Rounded anatomical division of an organ such as the brain, lung, or liver."),
    ("jaw", "anatomy", "Wait"),  # 3 letters - skip
    ("chin", "anatomy", "Lowermost front projection of the mandible in humans."),
    ("neck", "anatomy", "Part of the body connecting the head to the torso and housing the cervical spine."),
    ("hand", "anatomy", "Prehensile multi-fingered appendage at the end of the primate forearm."),
    ("head", "anatomy", "Anterior body region housing the brain and primary sense organs."),
    ("nose", "anatomy", "Olfactory and respiratory organ projecting from the vertebrate face."),
    ("face", "anatomy", "Front part of the head bearing the eyes, nose, and mouth."),
    ("hair", "anatomy", "Keratinous filament growing from follicles in mammalian skin."),
    ("nail", "anatomy", "Hard keratin plate protecting the tips of primate fingers and toes."),
    ("claw", "anatomy", "Curved pointed keratin appendage at the end of a digit in amniotes."),
    ("beak", "anatomy", "External keratinous bill of a bird, turtle, or cephalopod."),
    ("gill", "anatomy", "Feathery respiratory organ that extracts dissolved oxygen from water."),
    ("wing", "anatomy", "Forelimb or appendage adapted for flight in birds, bats, and insects."),
    ("tail", "anatomy", "Posterior flexible extension of the vertebral column."),
    ("hoof", "anatomy", "Hard keratinized covering on the toes of ungulate mammals."),
    ("horn", "anatomy", "Permanent pointed projection on the head of bovids, consisting of keratin over bone."),
    ("fetus", "anatomy", "Wait"),  # 5 letters
    ("womb", "anatomy", "The uterus, where mammalian offspring gestate before birth."),
    ("duct", "anatomy", "Tubular bodily channel that conveys secretions from a gland."),
    ("node", "anatomy", "Small mass of tissue such as a lymph node, or the point on a stem where leaves attach."),
    ("yolk", "anatomy", "Nutrient-rich portion of an egg that feeds the developing embryo."),
    ("cilia", "cell", "Wait"),  # 5 letters
    ("leaf", "plant", "Flattened photosynthetic organ of a vascular plant."),
    ("root", "plant", "Underground plant organ that anchors the plant and absorbs water and minerals."),
    ("stem", "plant", "Main structural axis of a vascular plant that supports leaves and flowers."),
    ("seed", "plant", "Embryonic plant enclosed in a protective coat with stored nutrients."),
    ("bark", "plant", "Protective outer layer of woody stems and roots in trees and shrubs."),
    ("pith", "plant", "Spongy ground tissue at the center of vascular plant stems."),
    ("bulb", "plant", "Underground storage organ composed of a short stem and fleshy scale leaves."),
    ("corm", "plant", "Swollen underground plant stem that stores food across winter or drought."),
    ("axil", "plant", "Upper angle between a leaf stalk and the stem from which it grows."),
    ("moss", "plant", "Small non-vascular bryophyte plant that reproduces via spores."),
    ("fern", "plant", "Seedless vascular plant with feathery fronds that reproduces via spores."),
    ("kelp", "plant", "Large brown marine algae that forms underwater forests in shallow oceans."),
    ("tree", "plant", "Perennial woody plant with an elongated main trunk and supporting branches."),
    ("vine", "plant", "Plant with a climbing or trailing stem that relies on other structures for support."),
    ("weed", "plant", "Fast-growing opportunistic plant that colonizes disturbed habitats."),
    ("herb", "plant", "Non-woody vascular plant whose aerial parts die back after flowering."),
    ("crop", "plant", "Cultivated plant grown at scale for food, fiber, or fuel, or a bird's food pouch."),
    ("cone", "plant", "Seed-bearing or pollen-bearing woody organ of gymnosperms, or a retinal photoreceptor."),
    ("flax", "plant", "Flowering plant cultivated for its bast fibers (linen) and oil-rich seeds."),
    ("hemp", "plant", "Fast-growing fibrous cannabis plant cultivated for bast fiber and seed oil."),
    ("corn", "plant", "Domesticated cereal grass (Zea mays) bearing kernels on a cob."),
    ("rice", "plant", "Semiquatic cereal grass that serves as a staple food crop worldwide."),
    ("oats", "plant", "Cereal grain grass grown for its nutritious seed heads."),
    ("rose", "plant", "Woody perennial flowering shrub of the family Rosaceae."),
    ("lily", "plant", "Herbaceous flowering monocot growing from an underground scaly bulb."),
    ("palm", "plant", "Monocot tree or shrub of the family Arecaceae with evergreen fronds."),
    ("pine", "plant", "Evergreen coniferous gymnosperm tree with needle-shaped leaves in bundles."),
    ("reed", "plant", "Tall grass-like wetland plant growing in marshes and along riverbanks."),
    ("turf", "plant", "Surface layer of soil bound together by dense grass roots."),
    ("bird", "organism", "Warm-blooded feathered vertebrate of the class Aves."),
    ("fish", "organism", "Gill-bearing aquatic craniate animal lacking limbs with digits."),
    ("frog", "organism", "Tailless amphibious vertebrate of the order Anura with jumping hind legs."),
    ("toad", "organism", "Stout-bodied anuran amphibian with dry, warty skin."),
    ("newt", "organism", "Semiquatic salamander in the subfamily Pleurodelinae."),
    ("worm", "organism", "Elongated soft-bodied invertebrate lacking limbs, such as an annelid or nematode."),
    ("slug", "organism", "Terrestrial gastropod mollusk that lacks an external shell."),
    ("crab", "organism", "Decapod crustacean with a broad carapace and a pair of pincers."),
    ("tick", "organism", "Blood-feeding parasitic arachnid of the order Ixodida."),
    ("mite", "organism", "Tiny arachnid of the subclass Acari found in soil, plants, and hosts."),
    ("wasp", "organism", "Flying hymenopteran insect with a narrow waist and venomous sting."),
    ("moth", "organism", "Mostly nocturnal lepidopteran insect with feathery or threadlike antennae."),
    ("flea", "organism", "Wingless blood-sucking parasitic insect famous for its jumping ability."),
    ("gnat", "organism", "Small two-winged dipteran insect related to midges and mosquitoes."),
    ("pupa", "organism", "Non-feeding developmental stage between larva and adult in complete metamorphosis."),
    ("grub", "organism", "Soft, thick-bodied larva of a beetle or other holometabolous insect."),
    ("deer", "organism", "Hoofed ruminant mammal of the family Cervidae that grows deciduous antlers."),
    ("goat", "organism", "Domesticated horned ruminant mammal in the genus Capra."),
    ("lion", "organism", "Large social predatory cat (Panthera leo) native to Africa and India."),
    ("wolf", "organism", "Social predatory canid (Canis lupus) and ancestor of the domestic dog."),
    ("bear", "organism", "Large omnivorous or carnivorous mammal of the family Ursidae."),
    ("seal", "organism", "Flipper-footed marine carnivoran mammal (pinniped)."),
    ("mink", "organism", "Semiquatic carnivorous mammal of the weasel family Mustelidae."),
    ("mole", "organism", "Burrowing insectivorous mammal with velvety fur and digging forepaws."),
    ("vole", "organism", "Small stout-bodied rodent related to lemmings and muskrats."),
    ("mice", "organism", "Small nocturnal rodents of the genus Mus used widely as model organisms."),
    ("bats", "organism", "Mammals of the order Chiroptera whose forelimbs form webbed wings for true flight."),
    ("swan", "organism", "Large aquatic waterfowl bird of the genus Cygnus."),
    ("duck", "organism", "Web-footed aquatic bird of the family Anatidae."),
    ("hawk", "organism", "Diurnal bird of prey with sharp talons, curved beak, and keen eyesight."),
    ("crow", "organism", "Intelligent omnivorous songbird of the genus Corvus."),
    ("wren", "organism", "Small, energetic insectivorous songbird with an upturned tail."),
    ("gull", "organism", "Web-footed coastal seabird of the family Laridae."),
    ("tuna", "organism", "Fast-swimming pelagic predatory bony fish of the family Scombridae."),
    ("carp", "organism", "Freshwater ray-finned bony fish native to Eurasia."),
    ("bass", "organism", "Spiny-rayed predatory freshwater or marine bony fish."),
    ("eel", "organism", "Wait"),  # 3 letters - skip
    ("prey", "ecology", "An animal hunted and killed by a predator for food."),
    ("host", "ecology", "Organism that harbors a parasite, mutualist, or commensal guest."),
    ("soil", "ecology", "Upper layer of earth composed of minerals, organic matter, and living microbes."),
    ("pond", "ecology", "Small body of still freshwater that supports aquatic plants and animals."),
    ("reef", "ecology", "Underwater ridge formed by calcium carbonate skeletons of colonial corals."),
    ("tide", "ecology", "Periodic rise and fall of sea levels that shapes intertidal ecosystems."),
    ("peat", "ecology", "Partially decayed plant matter accumulating in waterlogged acidic bogs."),
    ("wild", "ecology", "Living or growing in a natural state without human domestication."),
    ("gout", "disease", "Inflammatory arthritis caused by uric acid crystal deposits in joints."),
    ("rash", "disease", "Visible outbreak of red, inflamed, or bumpy spots on the skin."),
    ("sore", "disease", "Painful raw or ulcerated lesion on the skin or mucous membrane."),
    ("pain", "disease", "Distressing sensory and emotional signal triggered by tissue damage."),
    ("coma", "disease", "Prolonged state of deep unconsciousness from which a patient cannot be awakened."),
    ("burn", "disease", "Tissue injury caused by heat, chemicals, electricity, or radiation."),
    ("scab", "disease", "Protective crust of dried blood and serum formed over a healing wound."),
    ("scar", "disease", "Fibrous connective tissue that replaces normal skin after an injury."),
    ("wart", "disease", "Small benign rough growth on the skin caused by papillomavirus infection."),
    ("boil", "disease", "Painful pus-filled bacterial infection of a hair follicle."),
    ("zika", "disease", "Mosquito-borne flavivirus infection that can cause birth defects."),
    ("yaws", "disease", "Chronic tropical bacterial infection of the skin, bones, and joints."),

    # ==================== 5-LETTER ANSWERS (100) ====================
    ("cilia", "cell", "Short hair-like organelles on eukaryotic cells that beat for movement or flow."),
    ("golgi", "cell", "Eukaryotic organelle that modifies, sorts, and packages proteins for secretion."),
    ("lysis", "cell", "Rupture or disintegration of a cell caused by damage to its outer membrane."),
    ("lytic", "cell", "Relating to a viral cycle that destroys the host cell upon releasing new virions."),
    ("spore", "cell", "Reproductive or dormant cell capable of growing into a new individual without fusion."),
    ("pilus", "cell", "Hair-like appendage on bacterial surfaces used for attachment or DNA conjugation."),
    ("lumen", "cell", "The interior space of a tubular structure or membrane-bound organelle."),
    ("nuclei", "cell", "Wait"),  # 6 letters
    ("yeast", "cell", "Single-celled eukaryotic fungus that reproduces by budding or fission."),
    ("codon", "genetics", "Sequence of three DNA or RNA nucleotides that specifies a single amino acid."),
    ("genes", "genetics", "Hereditary units of DNA passed from parents to offspring."),
    ("locus", "genetics", "Specific fixed position on a chromosome where a particular gene is located."),
    ("exome", "genetics", "The protein-coding exon regions of an organism's genome."),
    ("intron", "genetics", "Wait"),  # 6 letters
    ("clone", "genetics", "Genetically identical copy of a cell, DNA fragment, or organism."),
    ("clade", "genetics", "Monophyletic group consisting of a common ancestor and all its descendants."),
    ("cross", "genetics", "Deliberate mating of two individuals to study or combine genetic traits."),
    ("trait", "genetics", "Genetically determined phenotypic characteristic of an organism."),
    ("amino", "molecule", "Organic compound containing both an amine and carboxyl group; building block of proteins."),
    ("actin", "molecule", "Globular protein that forms microfilaments in the cytoskeleton and muscle fibers."),
    ("lipid", "molecule", "Hydrophobic biomolecule including fats, oils, waxes, phospholipids, and steroids."),
    ("sugar", "molecule", "Sweet soluble carbohydrate such as glucose, fructose, or sucrose."),
    ("hemin", "molecule", "Crystalline chloride derivative of heme formed from hemoglobin."),
    ("renin", "molecule", "Enzyme secreted by the kidneys that regulates blood pressure and fluid balance."),
    ("latex", "molecule", "Milky emulsion of polymers exuded by certain flowering plants to deter herbivores."),
    ("resin", "molecule", "Viscous hydrocarbon secretion of conifers that seals wounds and traps insects."),
    ("mucus", "molecule", "Slippery aqueous secretion of mucous membranes that traps pathogens and particles."),
    ("venom", "molecule", "Toxic secretion injected by animals via fangs, stingers, or spines."),
    ("toxin", "molecule", "Poisonous substance produced within living cells or organisms."),
    ("prion", "molecule", "Misfolded infectious protein that triggers normal proteins in the brain to misfold."),
    ("auxin", "molecule", "Plant hormone that regulates cell elongation and phototropism."),
    ("chyle", "molecule", "Milky bodily fluid consisting of lymph and emulsified fats from the small intestine."),
    ("sebum", "molecule", "Oily waxy substance secreted by mammalian sebaceous glands to waterproof skin."),
    ("serum", "molecule", "Clear fluid portion of blood remaining after clotting proteins are removed."),
    ("Sweat", "molecule", "Wait"),  # fix case below
    ("sweat", "molecule", "Watery fluid secreted by sudoriferous glands in mammalian skin for thermoregulation."),
    ("urine", "molecule", "Liquid byproduct of metabolism filtered from the blood by the kidneys."),
    ("water", "molecule", "Polar solvent molecule (H2O) essential for all known forms of life."),
    ("ozone", "molecule", "Triatomic oxygen gas (O3) that shields Earth's biosphere from ultraviolet radiation."),
    ("redox", "molecule", "Coupled chemical reaction involving the transfer of electrons between species."),
    ("femur", "anatomy", "The thigh bone; the longest and strongest bone in the mammalian skeleton."),
    ("tibia", "anatomy", "The larger, weight-bearing inner bone of the vertebrate lower leg (shinbone)."),
    ("ilium", "anatomy", "The uppermost and largest region of the vertebrate hip bone (pelvis)."),
    ("talus", "anatomy", "Ankle bone that articulates with the tibia and fibula to form the ankle joint."),
    ("incus", "anatomy", "Anvil-shaped middle ear ossicle that transmits vibrations from malleus to stapes."),
    ("vomer", "anatomy", "Thin unpaired facial bone forming the inferior part of the nasal septum."),
    ("skull", "anatomy", "Bony framework of the vertebrate head that encloses and protects the brain."),
    ("spine", "anatomy", "Vertebral column supporting the trunk and protecting the spinal cord, or a sharp plant quill."),
    ("joint", "anatomy", "Articulation where two or more bones meet in the skeleton."),
    ("molar", "anatomy", "Broad flat posterior tooth adapted for grinding food."),
    ("heart", "anatomy", "Muscular organ that pumps blood through the circulatory system."),
    ("aorta", "anatomy", "Main and largest artery in the body, carrying oxygenated blood from the left ventricle."),
    ("atria", "anatomy", "Upper blood-receiving chambers of the vertebrate heart."),
    ("valve", "anatomy", "Flap in a heart chamber or blood vessel that enforces one-way fluid flow."),
    ("pulse", "anatomy", "Rhythmic throbbing of arteries as blood is propelled by heart contractions."),
    ("blood", "anatomy", "Circulating body fluid that delivers oxygen and nutrients and removes waste."),
    ("lymph", "anatomy", "Clear fluid carried through the lymphatic system containing white blood cells."),
    ("spleen", "anatomy", "Wait"),  # 6 letters
    ("liver", "anatomy", "Large metabolic organ that detoxifies blood, synthesizes proteins, and produces bile."),
    ("colon", "anatomy", "Main portion of the large intestine that absorbs water and electrolytes."),
    ("cecum", "anatomy", "Pouch at the beginning of the large intestine that receives chyme from the ileum."),
    ("ileum", "anatomy", "Final and longest segment of the small intestine where vitamin B12 and bile salts absorb."),
    ("rumen", "anatomy", "Largest fermentation stomach chamber in cud-chewing ruminant mammals."),
    ("gland", "anatomy", "Organ or group of cells specialized for synthesizing and secreting substances."),
    ("gonad", "anatomy", "Primary reproductive organ (testis or ovary) that produces gametes and sex hormones."),
    ("ovary", "anatomy", "Female reproductive organ that produces ova, or the swollen base of a flower carpel."),
    ("ovule", "plant", "Structure inside seed plants that contains the female gametophyte and develops into a seed."),
    ("xylem", "plant", "Vascular tissue in plants that conducts water and dissolved minerals upward from the roots."),
    ("frond", "plant", "Large divided leaf of a fern, palm, or cycad."),
    ("calyx", "plant", "Outermost whorl of flower parts formed collectively by the sepals."),
    ("petal", "plant", "Modified, often brightly colored leaf in a flower corolla that attracts pollinators."),
    ("sepal", "plant", "Individual outer floral leaf that encloses and protects a developing flower bud."),
    ("style", "plant", "Slender stalk of a flower carpel connecting the stigma to the ovary."),
    ("bract", "plant", "Modified specialized leaf associated with a flower or inflorescence."),
    ("stipe", "plant", "Stalk that supports amushroom cap, fern frond, or kelp thallus."),
    ("tuber", "plant", "Enlarged underground stem or root organ used by plants like potatoes to store starch."),
    ("fruit", "plant", "Mature ripened ovary of a flowering plant containing one or more seeds."),
    ("plant", "plant", "Multicellular photosynthetic eukaryote of the kingdom Plantae."),
    ("flora", "plant", "The collective plant life occurring in a particular region, habitat, or geological period."),
    ("algae", "plant", "Diverse group of aquatic photosynthetic eukaryotes ranging from unicells to giant kelp."),
    ("fungi", "organism", "Eukaryotic kingdom of spore-producing decomposers with chitin cell walls."),
    ("virus", "organism", "Submicroscopic infectious agent that replicates only inside living host cells."),
    ("phage", "organism", "Virus that infects and replicates within bacteria or archaea."),
    ("larva", "organism", "Active immature form of an insect, amphibian, or marine invertebrate before metamorphosis."),
    ("polyp", "organism", "Sessile cylindrical body form of cnidarians such as corals and sea anemones."),
    ("hydra", "organism", "Small freshwater cnidarian polyp known for its regenerative ability."),
    ("squid", "organism", "Fast-swimming marine cephalopod mollusk with eight arms and two tentacles."),
    ("snail", "organism", "Shelled gastropod mollusk that moves on a muscular ventral foot."),
    ("leech", "organism", "Segmented parasitic or predatory annelid worm with suckers at both ends."),
    ("shrew", "organism", "Small mole-like insectivorous mammal with a high metabolic rate."),
    ("lemur", "organism", "Strepsirrhine primate endemic to the island of Madagascar."),
    ("sloth", "organism", "Slow-moving arboreal xenarthran mammal native to tropical rainforests of the Americas."),
    ("whale", "organism", "Fully aquatic placental marine mammal of the infraorder Cetacea."),
    ("bison", "organism", "Large hump-backed grazing bovid mammal native to North America and Europe."),
    ("camel", "organism", "Even-toed ungulate adapted to arid habitats with fat-storing dorsal humps."),
    ("horse", "organism", "Odd-toed hoofed mammal (Equus caballus) adapted for swift running."),
    ("zebra", "organism", "African equid mammal recognized by its distinctive black-and-white striped coat."),
    ("sheep", "organism", "Domesticated ruminant mammal raised for its crimped wool fleece, meat, and milk."),
    ("swine", "organism", "Omnivorous even-toed ungulate mammals of the pig family Suidae."),
    ("mouse", "organism", "Small rodent with a pointed snout and long tail; the classic mammalian lab organism."),
    ("otter", "organism", "Semiquatic carnivorous mammal in the weasel family with webbed feet and dense fur."),
    ("panda", "organism", "Bamboo-eating bear (Ailuropoda melanoleuca) native to south-central China."),
    ("koala", "organism", "Arboreal herbivorous marsupial native to Australia that feeds on eucalyptus leaves."),
    ("hippo", "organism", "Large semiaquatic African artiodactyl mammal closely related to cetaceans."),
    ("rhino", "organism", "Large herbivorous odd-toed ungulate bearing one or two keratin horns on its snout."),
    ("tiger", "organism", "Largest living cat species (Panthera tigris), an apex predator with dark vertical stripes."),
    ("anole", "organism", "Small arboreal lizard of the Americas capable of changing skin color and extending a dewlap."),
    ("viper", "organism", "Venomous snake of the family Viperidae possessing long hinged hollow fangs."),
    ("cobra", "organism", "Venomous elapid snake capable of expanding its neck ribs into a threat hood."),
    ("gecko", "organism", "Small nocturnal lizard with adhesive toe pads that climb vertical surfaces."),
    ("snake", "organism", "Elongated legless carnivorous reptile of the suborder Serpentes."),
    ("shark", "organism", "Cartilaginous marine fish (Chondrichthyes) with multiple gill slits and replaceable teeth."),
    ("trout", "organism", "Freshwater and anadromous ray-finned fish of the salmon family Salmonidae."),
    ("perch", "organism", "Freshwater spiny-finned bony fish of the genus Perca."),
    ("guppy", "organism", "Small live-bearing freshwater fish widely used in genetics and ecology research."),
    ("heron", "organism", "Long-legged, long-necked freshwater and coastal wading bird."),
    ("egret", "organism", "White-plumaged wading bird of the heron family Ardeidae."),
    ("quail", "organism", "Small ground-nesting game bird of the pheasant family Phasianidae."),
    ("eagle", "organism", "Large diurnal bird of prey with broad wings and a hooked beak."),
    ("macaw", "organism", "Large brightly colored long-tailed Neotropical parrot."),
    ("aphid", "organism", "Small sap-sucking hemipteran insect that feeds on plant phloem."),
    ("midge", "organism", "Tiny two-winged dipteran fly found near aquatic habitats."),
    ("louse", "organism", "Wingless parasitic insect that lives on the skin, hair, or feathers of warm-blooded hosts."),
    ("taxon", "ecology", "A group of one or more populations of organisms treated as a unit by taxonomists."),
    ("genus", "ecology", "Taxonomic rank above species and below family, used as the first part of a binomial name."),
    ("biota", "ecology", "The total collection of organisms living in a geographic region or time period."),
    ("biome", "ecology", "Large ecological region defined by its climate, soil, vegetation, and wildlife."),
    ("niche", "ecology", "The ecological role, habitat use, and resource requirements of a species."),
    ("taiga", "ecology", "Subarctic boreal forest biome dominated by cone-bearing evergreen trees."),
    ("swamp", "ecology", "Forested wetland ecosystem saturated with standing or slow-moving water."),
    ("coral", "ecology", "Colonial marine cnidarian that secretes calcium carbonate to build ocean reefs."),
    ("feral", "ecology", "Living in a wild state after escaping from domestication or cultivation."),
    ("decay", "ecology", "Decomposition of dead organic matter by bacteria, fungi, and detritivores."),
    ("fever", "disease", "Elevated body temperature mounted as part of the immune response to infection."),
    ("ulcer", "disease", "Open sore on an external or internal body surface caused by a break in the membrane."),
    ("tumor", "disease", "Abnormal mass of tissue resulting from uncontrolled cell division."),
    ("edema", "disease", "Swelling caused by excess fluid trapped in the body's tissues."),
    ("colic", "disease", "Severe paroxysmal abdominal pain caused by spasm or obstruction in hollow organs."),
    ("lupus", "disease", "Chronic autoimmune disease in which the immune system attacks healthy tissues."),
    ("ebola", "disease", "Severe and often fatal viral hemorrhagic fever caused by Ebolavirus."),
    ("mange", "disease", "Skin disease of mammals caused by parasitic burrowing mites."),
    ("cough", "disease", "Sudden expulsion of air from the lungs to clear the airways of mucus or irritants."),
    ("palsy", "disease", "Paralysis or weakness of voluntary muscle movement, often accompanied by tremors."),
    ("villi", "anatomy", "Tiny finger-like projections lining the small intestine that maximize nutrient absorption."),
    ("brain", "anatomy", "Central organ of the nervous system that coordinates sensation, thought, and movement."),
    ("mouth", "anatomy", "Opening of the digestive tract where food is ingested and mechanically broken down."),

    # ==================== 6-LETTER ANSWERS (100) ====================
    ("vacuole", "cell", "Wait"),  # 7 letters
    ("nuclei", "cell", "Membrane-bound organelles that house the chromosomes in eukaryotic cells."),
    ("oocyte", "cell", "Immature female germ cell that develops into an ovum via meiosis."),
    ("zygote", "cell", "Diploid cell formed by the fusion of a sperm and an egg cell during fertilization."),
    ("gamete", "cell", "Haploid reproductive cell (sperm or egg) that unites during sexual reproduction."),
    ("morula", "cell", "Solid ball of 16 to 32 blastomeres formed by early cleavage of a fertilized ovum."),
    ("embryo", "cell", "Early multicellular stage of development in plants and animals before birth or hatching."),
    ("stroma", "cell", "Fluid-filled space surrounding the grana inside a chloroplast, or supportive tissue."),
    ("granum", "cell", "Stack of thylakoid discs inside a chloroplast where light reactions occur."),
    ("matrix", "cell", "Innermost compartment of a mitochondrion, or the extracellular material between cells."),
    ("wall", "cell", "Wait"),  # 4 letters
    ("sheath", "cell", "Insulating protective covering, such as the myelin sheath around nerve axons."),
    ("myelin", "cell", "Lipid-rich insulating layer around vertebrate nerve axons that speeds impulse conduction."),
    ("genome", "genetics", "The complete set of genetic material (DNA or RNA) present in an organism."),
    ("allele", "genetics", "One of two or more alternative forms of a gene at the same locus on a chromosome."),
    ("mutant", "genetics", "Organism or gene carrying a new heritable change in its DNA sequence."),
    ("hybrid", "genetics", "Offspring resulting from the crossbreeding of two genetically distinct parents or species."),
    ("intron", "genetics", "Non-coding RNA transcript segment spliced out before translation into protein."),
    ("operon", "genetics", "Cluster of bacterial genes under the control of a single promoter and operator."),
    ("vector", "genetics", "DNA plasmid or virus used to carry foreign genetic material, or a disease-transmitting organism."),
    ("diploid", "genetics", "Wait"),  # 7 letters
    ("meiotic", "genetics", "Wait"),  # 7 letters
    ("uracil", "molecule", "Pyrimidine nitrogenous base found in RNA that base-pairs with adenine."),
    ("ribose", "molecule", "Five-carbon pentose sugar that forms the structural backbone of RNA."),
    ("enzyme", "molecule", "Biological protein catalyst that speeds up chemical reactions inside cells."),
    ("kinase", "molecule", "Enzyme that catalyzes the transfer of phosphate groups from ATP to target substrates."),
    ("ligase", "molecule", "Enzyme that joins two DNA or other molecular strands together by forming covalent bonds."),
    ("urease", "molecule", "Enzyme that catalyzes the hydrolysis of urea into carbon dioxide and ammonia."),
    ("pepsin", "molecule", "Digestive protease enzyme in gastric juice that breaks down proteins in the stomach."),
    ("myosin", "molecule", "ATP-dependent motor protein that interacts with actin to generate muscle contraction."),
    ("dynein", "molecule", "Cytoskeletal motor protein that moves cargo along microtubules and drives ciliary beating."),
    ("fibrin", "molecule", "Insoluble fibrous protein formed during blood clotting that creates a mesh over wounds."),
    ("leptin", "molecule", "Hormone secreted by adipose cells that regulates energy balance by inhibiting hunger."),
    ("chitin", "molecule", "Tough structural polysaccharide forming fungal cell walls and arthropod exoskeletons."),
    ("lignin", "molecule", "Complex rigid polymer in plant cell walls that gives wood its strength."),
    ("starch", "molecule", "Polysaccharide carbohydrate produced by green plants as their main energy store."),
    ("nectar", "molecule", "Sugar-rich liquid secreted by plant glands to attract pollinating animals."),
    ("glycol", "molecule", "Organic diol compound containing two hydroxyl groups."),
    ("phenol", "molecule", "Aromatic organic compound present in plant secondary metabolites and disinfectants."),
    ("lysine", "molecule", "Essential positively charged amino acid required for protein synthesis."),
    ("valine", "molecule", "Branched-chain essential nonpolar amino acid used in biosynthesis of proteins."),
    ("serine", "molecule", "Polar amino acid that plays a key catalytic role in many enzymes."),
    ("biotin", "molecule", "Water-soluble B vitamin (B7) acting as a coenzyme in fatty acid and glucose metabolism."),
    ("folate", "molecule", "Water-soluble B vitamin (B9) essential for DNA synthesis, repair, and cell division."),
    ("oxygen", "molecule", "Diatomic gas produced by photosynthesis and required for aerobic cellular respiration."),
    ("carbon", "molecule", "Tetravalent chemical element that forms the covalent backbone of all organic molecules."),
    ("sulfur", "molecule", "Essential nonmetallic element found in the amino acids cysteine and methionine."),
    ("photon", "molecule", "Quantum packet of light energy absorbed by chlorophyll during photosynthesis."),
    ("ligand", "molecule", "Ion or molecule that binds specifically to a receptor or central protein to trigger a signal."),
    ("hapten", "molecule", "Small molecule that elicits an immune response only when attached to a carrier protein."),
    ("capsid", "molecule", "Protein shell that encloses and protects the genetic material of a virus."),
    ("virion", "molecule", "Complete, infectious virus particle outside a host cell."),
    ("spleen", "anatomy", "Lymphoid organ that filters blood, recycles old red blood cells, and fights infection."),
    ("kidney", "anatomy", "Bean-shaped organ that filters nitrogenous waste from blood and regulates fluid balance."),
    ("ureter", "anatomy", "Muscular duct that propels urine from the kidney to the urinary bladder."),
    ("uterus", "anatomy", "Hollow muscular female reproductive organ in mammals where the fetus develops."),
    ("vagina", "anatomy", "Muscular canal of the female mammalian reproductive tract."),
    ("testis", "anatomy", "Male reproductive gonad that produces sperm cells and androgens such as testosterone."),
    ("thymus", "anatomy", "Primary lymphoid organ in the chest where T lymphocytes mature."),
    ("tonsil", "anatomy", "Mass of lymphoid tissue at the back of the throat that helps defend against inhaled pathogens."),
    ("larynx", "anatomy", "Hollow muscular organ in the neck that holds the vocal cords (the voice box)."),
    ("throat", "anatomy", "Anterior part of the neck comprising the pharynx and larynx."),
    ("palate", "anatomy", "Roof of the mouth separating the oral cavity from the nasal cavity in vertebrates."),
    ("tongue", "anatomy", "Muscular organ in the mouth used for tasting, swallowing, and vocalization."),
    ("retina", "anatomy", "Light-sensitive neural tissue lining the back of the vertebrate eye."),
    ("cornea", "anatomy", "Transparent front part of the eye that covers the iris and pupil and refracts light."),
    ("cortex", "anatomy", "Outer layer of an organ such as the cerebral cortex, kidney, or plant stem."),
    ("neuron", "anatomy", "Electrically excitable nerve cell that transmits information via chemical and electrical signals."),
    ("muscle", "anatomy", "Contractile soft tissue that produces force, motion, and posture in animals."),
    ("tendon", "anatomy", "Tough band of fibrous connective tissue that connects muscle to bone."),
    ("fascia", "anatomy", "Sheet of collagenous connective tissue beneath the skin that surrounds muscles and organs."),
    ("dermis", "anatomy", "Thick middle layer of vertebrate skin containing blood vessels, nerves, and follicles."),
    ("tissue", "anatomy", "Ensemble of similar cells and their extracellular matrix that perform a shared function."),
    ("artery", "anatomy", "Muscular blood vessel that carries blood away from the heart under high pressure."),
    ("vessel", "anatomy", "Tubular channel that circulates blood or lymph in animals, or water in plant xylem."),
    ("atrium", "anatomy", "Upper chamber of the heart that receives blood returning from the veins."),
    ("pelvis", "anatomy", "Basin-shaped ring of bones connecting the vertebral column to the hind limbs."),
    ("sacrum", "anatomy", "Triangular bone at the base of the spine formed by fused sacral vertebrae."),
    ("radius", "anatomy", "One of the two large bones of the vertebrate forearm, on the thumb side."),
    ("fibula", "anatomy", "Slender outer bone of the vertebrate lower leg running alongside the tibia."),
    ("stapes", "anatomy", "Stirrup-shaped ossicle in the middle ear; the smallest bone in the human body."),
    ("thorax", "anatomy", "Chest region of vertebrates or the middle leg- and wing-bearing segment of insects."),
    ("coelom", "anatomy", "Fluid-filled main body cavity in most bilateral animals, lined by mesoderm."),
    ("cloaca", "anatomy", "Shared posterior opening for the digestive, urinary, and reproductive tracts in non-mammals."),
    ("amnion", "anatomy", "Innermost membrane enclosing the embryo of a reptile, bird, or mammal in amniotic fluid."),
    ("dorsal", "anatomy", "Relating to the upper side or back of an animal or structure."),
    ("apical", "plant", "Located at the growing tip (apex) of a plant shoot, root, or epithelial cell."),
    ("phloem", "plant", "Living vascular tissue in plants that transports sugars produced by photosynthesis."),
    ("cambium", "plant", "Wait"),  # 7 letters
    ("stamen", "plant", "Pollen-producing male reproductive organ of a flower, consisting of anther and filament."),
    ("anther", "plant", "Pollen-bearing sac at the tip of a flower's stamen."),
    ("stigma", "plant", "Sticky receptive tip of a flower carpel where pollen grains land and germinate."),
    ("pollen", "plant", "Fine powder of microgametophytes produced by seed plants that carries male gametes."),
    ("flower", "plant", "Reproductive shoot of an angiosperm bearing petals, sepals, stamens, and carpels."),
    ("lamina", "plant", "Expanded flat blade of a leaf or seaweed, or a thin layer of tissue."),
    ("botany", "plant", "Branch of biology dedicated to the scientific study of plants."),
    ("lichen", "plant", "Composite organism arising from a mutualistic symbiosis between a fungus and an alga."),
    ("orchid", "plant", "Diverse family of monocot flowering plants with bilaterally symmetrical blooms."),
    ("cactus", "plant", "Succulent spiny plant of the family Cactaceae adapted to arid environments."),
    ("bamboo", "plant", "Fast-growing woody perennial evergreen grass in the subfamily Bambusoideae."),
    ("baleen", "anatomy", "Keratinous filter-feeding plates hanging from the upper jaw of toothless whales."),
    ("mantis", "organism", "Predatory insect of the order Mantodea with raptorial front legs."),
    ("cicada", "organism", "Large homopteran insect known for the loud acoustic calls of males."),
    ("beetle", "organism", "Insect of the order Coleoptera whose forewings are hardened into protective elytra."),
    ("isopod", "organism", "Crustacean order including woodlice, pillbugs, and deep-sea giant isopods."),
    ("shrimp", "organism", "Swimming decapod crustacean with a laterally compressed body and long antennae."),
    ("mussel", "organism", "Filter-feeding bivalve mollusk that attaches to substrates via byssal threads."),
    ("limpet", "organism", "Aquatic gastropod mollusk with a conical shell and strong muscular foot."),
    ("sponge", "organism", "Simple porous aquatic animal of the phylum Porifera that filter-feeds on water currents."),
    ("medusa", "organism", "Free-swimming umbrella-shaped jellyfish stage in the cnidarian life cycle."),
    ("amoeba", "organism", "Unicellular eukaryote that moves and engulfs prey using temporary pseudopods."),
    ("fungus", "organism", "Heterotrophic eukaryote with chitinous cell walls that absorbs nutrients from its surroundings."),
    ("mammal", "organism", "Warm-blooded vertebrate with hair, three middle-ear bones, and milk-producing glands."),
    ("rodent", "organism", "Mammal of the order Rodentia characterized by continuously growing incisors."),
    ("monkey", "organism", "Tailed simian primate of either the New World or Old World lineages."),
    ("gibbon", "organism", "Small tailless arboreal ape native to tropical rainforests of Southeast Asia."),
    ("jaguar", "organism", "Large spotted felid apex predator (Panthera onca) native to the Americas."),
    ("cougar", "organism", "Large solitary American cat (Puma concolor), also known as the mountain lion or puma."),
    ("ferret", "organism", "Domesticated slender carnivorous mustelid mammal related to the polecat."),
    ("rabbit", "organism", "Small herbivorous lagomorph mammal with long ears and powerful hind legs."),
    ("dugong", "organism", "Herbivorous marine mammal of the order Sirenia that grazes on seagrass beds."),
    ("muskox", "organism", "Thick-coated Arctic bovid mammal known for its curved horns and defensive circles."),
    ("salmon", "organism", "Anadromous ray-finned fish that hatches in freshwater, migrates to sea, and returns to spawn."),
    ("pigeon", "organism", "Stout-bodied seed- and fruit-eating bird of the family Columbidae."),
    ("parrot", "organism", "Hook-billed, often vividly colored bird of the order Psittaciformes."),
    ("raptor", "organism", "Bird of prey that hunts vertebrates using keen vision, hooked beak, and sharp talons."),
    ("plover", "organism", "Short-billed wading shorebird that hunts invertebrates by sight."),
    ("canine", "organism", "Member of the dog family Canidae, or a pointed conical mammalian tooth."),
    ("equine", "organism", "Relating to horses or other members of the equid family Equidae."),
    ("phylum", "ecology", "Major taxonomic rank below kingdom and above class, grouping animals by body plan."),
    ("domain", "ecology", "Highest taxonomic rank grouping all cellular life into Bacteria, Archaea, and Eukaryota."),
    ("tundra", "ecology", "Treeless polar or alpine biome characterized by permafrost and low-growing vegetation."),
    ("forest", "ecology", "Terrestrial ecosystem dominated by a dense canopy of trees."),
    ("desert", "ecology", "Arid biome receiving very little precipitation, inhabited by xerophytic plants and animals."),
    ("island", "ecology", "Isolated landmass surrounded by water, classic natural laboratory for speciation."),
    ("torpor", "ecology", "State of decreased physiological activity and lowered body temperature in animals."),
    ("quorum", "ecology", "Density-dependent cell-to-cell signaling mechanism used by bacteria to coordinate gene expression."),
    ("sepsis", "disease", "Life-threatening organ dysfunction caused by a dysregulated host response to infection."),
    ("anemia", "disease", "Condition in which blood lacks enough healthy red blood cells or hemoglobin to carry oxygen."),
    ("asthma", "disease", "Chronic inflammatory condition of the lung airways causing reversible bronchospasm."),
    ("scurvy", "disease", "Connective-tissue disease caused by severe dietary deficiency of vitamin C."),
    ("rabies", "disease", "Deadly neurotropic viral disease transmitted through the saliva of infected mammals."),
    ("typhus", "disease", "Group of infectious diseases caused by Rickettsia bacteria and spread by lice or fleas."),
    ("dengue", "disease", "Mosquito-borne tropical viral infection causing high fever, rash, and severe joint pain."),
    ("herpes", "disease", "Viral infection caused by herpesviruses that establishes lifelong latent infection in nerves."),
    ("cancer", "disease", "Disease characterized by uncontrolled division of abnormal cells that can invade tissues."),
    ("glioma", "disease", "Tumor that arises from glial cells in the brain or spinal cord."),
    ("lipoma", "disease", "Slow-growing, harmless fatty lump that forms most often between skin and muscle."),
    ("biopsy", "disease", "Medical removal of a sample of cells or tissue for diagnostic examination."),

    # ==================== 7-LETTER ANSWERS (100) ====================
    ("mitosis", "cell", "Eukaryotic cell division that produces two genetically identical daughter nuclei."),
    ("meiosis", "cell", "Reduction division that halves chromosome number to produce four haploid gametes."),
    ("osmosis", "cell", "Net diffusion of water molecules across a selectively permeable membrane."),
    ("fission", "cell", "Asexual reproduction in which a cell or organism splits into two separate individuals."),
    ("vacuole", "cell", "Membrane-bound organelle that stores water, nutrients, or waste and maintains turgor."),
    ("vesicle", "cell", "Small membrane-enclosed sac that transports or stores substances within a cell."),
    ("cytosol", "cell", "Aqueous fluid component of the cytoplasm surrounding the cell's organelles."),
    ("nucleus", "cell", "Membrane-enclosed eukaryotic organelle that contains the cell's chromosomes."),
    ("plastid", "cell", "Double-membrane organelle in plant and algal cells, such as a chloroplast or amyloplast."),
    ("tubule", "cell", "Wait"),  # 6 letters
    ("biofilm", "cell", "Structured community of microorganisms attached to a surface and embedded in matrix."),
    ("syncytia", "cell", "Wait"),  # 8 letters
    ("haploid", "genetics", "Having a single set of unpaired chromosomes, as in gametes (n)."),
    ("diploid", "genetics", "Containing two complete homologous sets of chromosomes, one from each parent (2n)."),
    ("lineage", "genetics", "Evolutionary descent of a species, cell population, or gene from a common ancestor."),
    ("linkage", "genetics", "Tendency of genes located close together on the same chromosome to be inherited together."),
    ("mitogen", "genetics", "Chemical substance, typically a protein, that triggers a cell to begin mitosis."),
    ("plasmid", "genetics", "Small circular double-stranded DNA molecule in bacteria that replicates independently."),
    ("histone", "genetics", "Alkaline nuclear protein around which DNA winds to form chromatin nucleosomes."),
    ("thymine", "genetics", "Pyrimidine nitrogenous base in DNA that pairs specifically with adenine."),
    ("adenine", "genetics", "Purine nitrogenous base in DNA, RNA, and ATP that pairs with thymine or uracil."),
    ("guanine", "genetics", "Purine nitrogenous base in DNA and RNA that forms three hydrogen bonds with cytosine."),
    ("operons", "genetics", "Functionally related gene clusters regulated together under a single promoter."),
    ("mutagen", "genetics", "Physical or chemical agent that permanently alters genetic material and increases mutations."),
    ("protein", "molecule", "Macromolecule composed of one or more folded chains of amino acid residues."),
    ("peptide", "molecule", "Short chain of amino acids linked together by covalent amide (peptide) bonds."),
    ("glucose", "molecule", "Six-carbon monosaccharide sugar that serves as the primary energy source for cells."),
    ("sucrose", "molecule", "Disaccharide sugar composed of glucose and fructose; transported in plant phloem."),
    ("lactose", "molecule", "Disaccharide sugar composed of galactose and glucose present in mammalian milk."),
    ("maltose", "molecule", "Disaccharide formed from two units of glucose during the digestion of starch."),
    ("amylase", "molecule", "Digestive enzyme in saliva and pancreatic juice that hydrolyzes starch into sugars."),
    ("lactase", "molecule", "Brush-border enzyme in the small intestine that breaks down lactose sugar."),
    ("protease", "molecule", "Wait"),  # 8 letters
    ("lipases", "molecule", "Enzymes that catalyze the breakdown of dietary fats into fatty acids and glycerol."),
    ("insulin", "molecule", "Peptide hormone secreted by pancreatic beta cells that lowers blood glucose levels."),
    ("hormone", "molecule", "Signaling molecule transported through blood or sap to regulate distant tissues."),
    ("gastrin", "molecule", "Peptide hormone that stimulates secretion of gastric acid by the stomach lining."),
    ("melanin", "molecule", "Natural dark pigment that gives color to skin, hair, feathers, and eyes."),
    ("keratin", "molecule", "Tough fibrous structural protein forming hair, nails, feathers, horns, and outer skin."),
    ("elastin", "molecule", "Highly elastic connective tissue protein that allows skin and arteries to snap back."),
    ("kinesin", "molecule", "Motor protein that walks along microtubule tracks to transport cellular cargo."),
    ("antigen", "molecule", "Molecule or molecular structure on a pathogen that triggers an immune response."),
    ("agonist", "molecule", "Substance that binds to a physiological receptor and activates a biological response."),
    ("alanine", "molecule", "Nonpolar alpha-amino acid used in the biosynthesis of proteins."),
    ("leucine", "molecule", "Essential branched-chain amino acid that stimulates muscle protein synthesis."),
    ("proline", "molecule", "Cyclic amino acid that introduces sharp kinks into polypeptide chains."),
    ("glycine", "molecule", "Smallest and simplest amino acid, carrying a single hydrogen atom as its side chain."),
    ("stearic", "molecule", "Common saturated 18-carbon fatty acid found in animal and plant lipids."),
    ("abdomen", "anatomy", "Posterior body region of vertebrates (belly) or the third tagma of arthropods."),
    ("stomach", "anatomy", "Muscular J-shaped digestive organ that secretes acid and enzymes to break down food."),
    ("foregut", "anatomy", "Anterior section of the alimentary canal, from the mouth to the beginning of the midgut."),
    ("midgut", "anatomy", "Wait"),  # 6 letters
    ("hindgut", "anatomy", "Posterior part of the digestive tract, including the distal colon and rectum."),
    ("viscera", "anatomy", "The internal organs of the main cavities of the body, especially in the abdomen."),
    ("urethra", "anatomy", "Duct that conveys urine from the urinary bladder to the exterior of the body."),
    ("oviduct", "anatomy", "Tube through which an ovum passes from an ovary (the Fallopian tube in mammals)."),
    ("chorion", "anatomy", "Outermost fetal membrane around the embryo in reptiles, birds, and mammals."),
    ("placenta", "anatomy", "Wait"),  # 8 letters
    ("alveoli", "anatomy", "Tiny air sacs in mammalian lungs where oxygen and carbon dioxide exchange with blood."),
    ("bronchi", "anatomy", "Main airway passages that branch off the trachea into the left and right lungs."),
    ("trachea", "anatomy", "Cartilage-ringed windpipe connecting the larynx to the bronchi of the lungs."),
    ("saliva", "anatomy", "Wait"),  # 6 letters
    ("cardiac", "anatomy", "Relating to the heart or the upper opening of the stomach."),
    ("systole", "anatomy", "Phase of the heartbeat when heart muscle contracts and pumps blood into the arteries."),
    ("coronary", "anatomy", "Wait"),  # 8 letters
    ("hepatic", "anatomy", "Relating to or situated in the liver."),
    ("adrenal", "anatomy", "Endocrine gland atop each kidney that secretes adrenaline, cortisol, and aldosterone."),
    ("thyroid", "anatomy", "Butterfly-shaped endocrine gland in the neck that regulates metabolic rate."),
    ("pituitary", "anatomy", "Wait"),  # 9 letters
    ("synapse", "anatomy", "Junction between two nerve cells across which impulses pass by neurotransmitter diffusion."),
    ("ganglia", "anatomy", "Clusters of neuron cell bodies located in the peripheral nervous system."),
    ("cranial", "anatomy", "Relating to the skull or cranium."),
    ("cranium", "anatomy", "Portion of the vertebrate skull that encloses and protects the brain."),
    ("maxilla", "anatomy", "Upper jawbone formed by the fusion of two maxillary bones in vertebrates."),
    ("sternum", "anatomy", "Flat breastbone at the center of the chest that connects to the ribs via cartilage."),
    ("scapula", "anatomy", "Shoulder blade bone connecting the humerus with the clavicle."),
    ("humerus", "anatomy", "Long bone of the upper arm or forelimb running from the shoulder to the elbow."),
    ("patella", "anatomy", "Thick circular-triangular kneecap bone that protects the anterior knee joint."),
    ("ventral", "anatomy", "Relating to the underside or abdominal surface of an animal."),
    ("cuticle", "anatomy", "Waxy protective outer layer covering plant leaves or the exoskeleton of invertebrates."),
    ("cambium", "plant", "Meristematic tissue layer in vascular plants that produces secondary xylem and phloem."),
    ("stomata", "plant", "Microscopic adjustable pores in plant leaves that control gas exchange and transpiration."),
    ("thallus", "plant", "Undifferentiated vegetative body of an alga, fungus, lichen, or liverwort."),
    ("sapling", "plant", "Young slender tree that has grown past the seedling stage."),
    ("conifer", "plant", "Cone-bearing gymnosperm tree or shrub such as a pine, fir, spruce, or cedar."),
    ("rhizome", "plant", "Horizontal underground plant stem that sends out roots and shoots from its nodes."),
    ("seedbed", "plant", "Local soil environment in which seeds germinate and seedlings establish."),
    ("microbe", "organism", "Microscopic living organism, such as a bacterium, archaeon, protist, or unicellular fungus."),
    ("archaea", "organism", "Domain of single-celled prokaryotic microorganisms distinct from bacteria and eukaryotes."),
    ("bacilli", "organism", "Rod-shaped bacteria, or members of the bacterial class Bacilli."),
    ("protist", "organism", "Eukaryotic organism that is not an animal, land plant, or fungus."),
    ("euglena", "organism", "Single-celled flagellated eukaryote that both photosynthesizes and ingests food."),
    ("giardia", "organism", "Flagellated parasitic protozoan that colonizes the small intestine and causes giardiasis."),
    ("mollusk", "organism", "Soft-bodied invertebrate of the phylum Mollusca, such as a snail, clam, or octopus."),
    ("octopus", "organism", "Eight-armed soft-bodied marine cephalopod mollusk renowned for its intelligence."),
    ("annelid", "organism", "Segmented worm of the phylum Annelida, including earthworms, leeches, and polychaetes."),
    ("lobster", "organism", "Large marine decapod crustacean with muscular tail and heavy pincers."),
    ("catfish", "organism", "Ray-finned bony fish notable for its prominent whisker-like sensory barbels."),
    ("minnow", "organism", "Wait"),  # 6 letters
    ("tadpole", "organism", "Aquatic gill-breathing larval stage of a frog or toad."),
    ("reptile", "organism", "Cold-blooded air-breathing amniote vertebrate covered in epidermal scales or scutes."),
    ("amniote", "organism", "Tetrapod vertebrate (reptile, bird, or mammal) whose embryo develops inside an amnion."),
    ("seabird", "organism", "Bird adapted to life within the marine environment."),
    ("primate", "organism", "Mammal of the order Primates, with forward-facing eyes, large brain, and grasping hands."),
    ("hominid", "organism", "Member of the great ape family Hominidae, including humans, chimpanzees, gorillas, and orangutans."),
    ("gorilla", "organism", "Largest living primate, an herbivorous ground-dwelling great ape native to central Africa."),
    ("raccoon", "organism", "Medium-sized nocturnal omnivorous mammal native to North America with a facial mask."),
    ("mammals", "organism", "Vertebrate animals of class Mammalia that nourish their young with milk from mammary glands."),
    ("insects", "organism", "Hexapod arthropods with three-part bodies (head, thorax, abdomen) and compound eyes."),
    ("biology", "ecology", "The natural science that studies life, living organisms, and their evolution."),
    ("zoology", "ecology", "Branch of biology devoted to the study of animal structure, behavior, and classification."),
    ("ecology", "ecology", "Scientific study of interactions among organisms and their biophysical environment."),
    ("species", "ecology", "Fundamental taxonomic unit of organisms capable of interbreeding to produce fertile offspring."),
    ("kingdom", "ecology", "High-level taxonomic rank below domain, such as Animalia, Plantae, or Fungi."),
    ("ecotone", "ecology", "Transition zone of high biodiversity where two distinct ecological communities meet."),
    ("prairie", "ecology", "Temperate grassland ecosystem dominated by herbaceous grasses and forbs."),
    ("benthos", "ecology", "Community of organisms living on, in, or near the bottom sediment of a sea or lake."),
    ("benthic", "ecology", "Relating to the ecological region at the lowest level of a body of water."),
    ("abyssal", "ecology", "Relating to the deep ocean floor zone between 3,000 and 6,000 meters depth."),
    ("diurnal", "ecology", "Active during daylight hours, or recurring on a twenty-four-hour daily cycle."),
    ("endemic", "ecology", "Native and restricted to a single defined geographic region or island."),
    ("extinct", "ecology", "Having no living members remaining anywhere on Earth."),
    ("habitat", "ecology", "Natural environment in which a particular species lives, feeds, and reproduces."),
    ("foodweb", "ecology", "Interconnected network of food chains showing who eats whom in an ecological community."),
    ("carrion", "ecology", "Decaying flesh of dead animals that serves as food for scavengers and decomposers."),
    ("asexual", "ecology", "Reproduction originating from a single parent without the fusion of gametes."),
    ("aerobic", "ecology", "Requiring free oxygen for cellular respiration or occurring in oxygenated environments."),
    ("disease", "disease", "Abnormal condition that impairs the normal structure or function of an organism."),
    ("malaria", "disease", "Mosquito-borne infectious disease caused by Plasmodium protozoan parasites."),
    ("cholera", "disease", "Acute diarrheal bacterial infection of the intestine caused by Vibrio cholerae."),
    ("tetanus", "disease", "Bacterial infection by Clostridium tetani causing painful muscle spasms and lockjaw."),
    ("leprosy", "disease", "Chronic bacterial infection by Mycobacterium leprae affecting skin and peripheral nerves."),
    ("measles", "disease", "Highly contagious viral respiratory infection causing fever and a red skin rash."),
    ("rubella", "disease", "Contagious viral infection (German measles) known for its distinctive red rash."),
    ("allergy", "disease", "Hypersensitive immune response to a normally harmless environmental substance."),
    ("abscess", "disease", "Localized collection of pus within inflamed tissue caused by bacterial infection."),
    ("colitis", "disease", "Inflammation of the inner lining of the colon."),
    ("atrophy", "disease", "Partial or complete wasting away of a body part or tissue due to cell shrinkage."),
    ("chronic", "disease", "Persisting for a long time or constantly recurring."),
    ("icterus", "disease", "Jaundice; yellowish pigmentation of skin and sclera caused by high bilirubin levels."),
]

VALID_TOPICS = {
    "cell",
    "molecule",
    "genetics",
    "anatomy",
    "organism",
    "plant",
    "disease",
    "ecology",
}

TRUNCATIONS = {
    "mitosi",
    "meiosi",
    "collag",
    "glucos",
    "insuli",
    "amylas",
    "bacter",
    "reptil",
    "dopami",
    "toxopl",
    "giardi",
    "spiroc",
    "euglen",
    "rotavi",
    "malari",
    "angios",
    "recept",
    "vesicl",
    "replic",
    "bronch",
    "flagel",
    "archae",
    "pseud",
    "cyto",
    "ecto",
    "thermo",
    "cotyle",
    "measle",
}


def classify_rejection(word: str, accepted_set: set[str]) -> str:
    if not re.fullmatch(r"[a-z]{4,7}", word):
        return "invalid_length_or_characters"
    if word in TRUNCATIONS:
        return "truncated_token"
    if word in {"aids", "adhd", "ussr", "unesco", "pubmed"}:
        return "acronym_or_proper_noun"
    if word.endswith("s") and word[:-1] in accepted_set:
        return f"plural_of_{word[:-1]}"
    if word.endswith("ae") or word.endswith("us") or word.endswith("ia"):
        return "latin_genus_or_taxon_name"
    return "non_biology_or_excluded_for_curation"


def main() -> None:
    seen: set[str] = set()
    answers: list[dict[str, str]] = []

    for word, topic, definition in CURATED_ANSWERS:
        if len(definition) < 20:
            continue
        w = word.strip().lower()
        if not re.fullmatch(r"[a-z]{4,7}", w):
            continue
        if w in seen:
            continue
        assert topic in VALID_TOPICS, f"Invalid topic {topic} for {w}"
        assert 20 <= len(definition) <= 120, f"Definition length invalid ({len(definition)}): {w}"
        seen.add(w)
        answers.append({"word": w, "topic": topic, "definition": definition})

    by_len: dict[int, list[dict[str, str]]] = {4: [], 5: [], 6: [], 7: []}
    for entry in answers:
        by_len[len(entry["word"])].append(entry)

    for length, items in by_len.items():
        print(f"Curated answers of length {length}: {len(items)}")
        assert len(items) >= 75, f"Expected >= 75 answers of length {length}, got {len(items)}"

    ANSWERS_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    ANSWERS_JSON_PATH.write_text(
        json.dumps(answers, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # Write rejected audit log from raw bio_words_raw.txt
    if RAW_WORDS_PATH.exists():
        raw_words = [
            line.strip().lower()
            for line in RAW_WORDS_PATH.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        rejected_lines: list[str] = []
        seen_raw: set[str] = set()
        for rw in raw_words:
            if rw in seen_raw or rw in seen:
                continue
            seen_raw.add(rw)
            reason = classify_rejection(rw, seen)
            rejected_lines.append(f"{rw}\t{reason}")
        REJECTED_PATH.write_text(
            "\n".join(rejected_lines) + "\n",
            encoding="utf-8",
        )
        print(f"Rejected raw words logged: {len(rejected_lines)}")

    # Download ENABLE word list and build allowed-{4,5,6,7}.txt
    print(f"Fetching ENABLE word list from {ENABLE_URL} ...")
    req = urllib.request.urlopen(ENABLE_URL, timeout=20)
    enable_raw = req.read().decode("utf-8")
    enable_words = [w.strip().lower() for w in enable_raw.splitlines() if w.strip()]

    ALLOWED_DIR.mkdir(parents=True, exist_ok=True)
    total_allowed = 0
    for length in (4, 5, 6, 7):
        pattern = re.compile(rf"^[a-z]{{{length}}}$")
        allowed_set = {w for w in enable_words if pattern.match(w)}
        for ans in by_len[length]:
            allowed_set.add(ans["word"])
        sorted_words = sorted(allowed_set)
        total_allowed += len(sorted_words)
        out_path = ALLOWED_DIR / f"allowed-{length}.txt"
        out_path.write_text("\n".join(sorted_words) + "\n", encoding="utf-8")
        print(f"Wrote {out_path.relative_to(ROOT)}: {len(sorted_words)} words")

    print(f"Total allowed words (4-7 letters): {total_allowed}")


if __name__ == "__main__":
    main()
