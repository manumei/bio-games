export type CellType = "animal" | "plant" | "bacteria";

export interface CellPart {
  id: string;
  name: string;
  label: string;
  aliases: string[];
  cells: CellType[];
  difficulty: 1 | 2 | 3;
  fn: string;
}

const RAW_PARTS: readonly Omit<CellPart, "label">[] = [
  {
    id: "cell_membrane",
    name: "Cell membrane",
    aliases: [
      "plasma membrane",
      "cytoplasmic membrane",
      "plasmalemma",
      "cell membrane (plasma membrane)",
    ],
    cells: ["animal", "plant", "bacteria"],
    difficulty: 1,
    fn: "Selectively permeable phospholipid bilayer that controls what enters and leaves the cell.",
  },
  {
    id: "cytoplasm",
    name: "Cytoplasm",
    aliases: ["cytosol", "intracellular fluid"],
    cells: ["animal", "plant", "bacteria"],
    difficulty: 1,
    fn: "Jelly-like cytosol and suspended structures filling the cell interior where metabolic reactions occur.",
  },
  {
    id: "nucleus",
    name: "Nucleus",
    aliases: ["cell nucleus"],
    cells: ["animal", "plant"],
    difficulty: 1,
    fn: "Membrane-bound organelle that houses the eukaryotic cell's chromosomal DNA and coordinates gene expression.",
  },
  {
    id: "nucleolus",
    name: "Nucleolus",
    aliases: ["nucleoli"],
    cells: ["animal", "plant"],
    difficulty: 2,
    fn: "Dense sub-region inside the nucleus where ribosomal RNA (rRNA) is transcribed and ribosome subunits assemble.",
  },
  {
    id: "nuclear_envelope",
    name: "Nuclear envelope",
    aliases: ["nuclear membrane", "karyotheca"],
    cells: ["animal", "plant"],
    difficulty: 2,
    fn: "Double-membrane barrier perforated by nuclear pores that regulates transport into and out of the nucleus.",
  },
  {
    id: "mitochondrion",
    name: "Mitochondrion",
    aliases: ["mitochondria", "chondriosome"],
    cells: ["animal", "plant"],
    difficulty: 1,
    fn: "Produces most of the cell's ATP through cellular respiration: the powerhouse of the cell ⚡",
  },
  {
    id: "rough_er",
    name: "Rough endoplasmic reticulum",
    aliases: ["rough er", "rer", "granular endoplasmic reticulum"],
    cells: ["animal", "plant"],
    difficulty: 2,
    fn: "Ribosome-studded membrane network that synthesizes, folds, and processes secreted and membrane proteins.",
  },
  {
    id: "smooth_er",
    name: "Smooth endoplasmic reticulum",
    aliases: ["smooth er", "ser", "agranular endoplasmic reticulum"],
    cells: ["animal", "plant"],
    difficulty: 2,
    fn: "Tubular membrane network lacking ribosomes that synthesizes lipids, steroids, and detoxifies compounds.",
  },
  {
    id: "golgi",
    name: "Golgi apparatus",
    aliases: ["golgi", "golgi body", "golgi complex", "dictyosome"],
    cells: ["animal", "plant"],
    difficulty: 1,
    fn: "Stack of flattened membrane sacs that modifies, sorts, and packages proteins and lipids for delivery.",
  },
  {
    id: "lysosome",
    name: "Lysosome",
    aliases: ["lysosomes"],
    cells: ["animal"],
    difficulty: 2,
    fn: "Acidic digestive organelle containing hydrolytic enzymes that break down waste, debris, and pathogens.",
  },
  {
    id: "ribosome",
    name: "Ribosome",
    aliases: ["ribosomes"],
    cells: ["animal", "plant", "bacteria"],
    difficulty: 2,
    fn: "Ribonucleoprotein complex that translates mRNA codons into polypeptide chains during protein synthesis.",
  },
  {
    id: "centriole",
    name: "Centrioles",
    aliases: ["centriole", "centrosome", "basal body"],
    cells: ["animal"],
    difficulty: 3,
    fn: "Paired barrel-shaped microtubule structures in the centrosome that organize the mitotic spindle.",
  },
  {
    id: "vesicle",
    name: "Vesicle",
    aliases: ["vesicles", "transport vesicle", "secretory vesicle"],
    cells: ["animal", "plant"],
    difficulty: 3,
    fn: "Small membrane-enclosed sac that ferries cargo between organelles and to or from the plasma membrane.",
  },
  {
    id: "peroxisome",
    name: "Peroxisome",
    aliases: ["peroxisomes", "microbody"],
    cells: ["animal", "plant"],
    difficulty: 3,
    fn: "Oxidative organelle that breaks down very-long-chain fatty acids and neutralizes toxic hydrogen peroxide.",
  },
  {
    id: "cell_wall",
    name: "Cell wall",
    aliases: ["peptidoglycan wall", "cellulose wall"],
    cells: ["plant", "bacteria"],
    difficulty: 1,
    fn: "Rigid outer structural layer surrounding the plasma membrane that provides support and prevents bursting.",
  },
  {
    id: "chloroplast",
    name: "Chloroplast",
    aliases: ["chloroplasts", "plastid"],
    cells: ["plant"],
    difficulty: 1,
    fn: "Chlorophyll-rich organelle with thylakoid stacks that captures light energy to drive photosynthesis.",
  },
  {
    id: "central_vacuole",
    name: "Central vacuole",
    aliases: ["vacuole", "large central vacuole", "tonoplast vacuole"],
    cells: ["plant"],
    difficulty: 1,
    fn: "Large fluid-filled sac that stores water and solutes while maintaining turgor pressure against the cell wall.",
  },
  {
    id: "plasmodesmata",
    name: "Plasmodesmata",
    aliases: ["plasmodesma"],
    cells: ["plant"],
    difficulty: 3,
    fn: "Microscopic cytoplasmic channels through the plant cell wall that connect adjacent cells for transport.",
  },
  {
    id: "capsule",
    name: "Capsule",
    aliases: ["bacterial capsule", "glycocalyx", "slime layer"],
    cells: ["bacteria"],
    difficulty: 2,
    fn: "Polysaccharide outer coating around a bacterium that aids surface attachment and evades host phagocytosis.",
  },
  {
    id: "nucleoid",
    name: "Nucleoid",
    aliases: ["nucleoid region", "bacterial chromosome"],
    cells: ["bacteria"],
    difficulty: 2,
    fn: "Irregularly shaped cytoplasmic region containing the prokaryotic cell's circular chromosomal DNA.",
  },
  {
    id: "plasmid",
    name: "Plasmid",
    aliases: ["plasmids", "extrachromosomal dna"],
    cells: ["bacteria"],
    difficulty: 2,
    fn: "Small circular double-stranded DNA molecule separate from chromosomal DNA, often carrying resistance genes.",
  },
  {
    id: "flagellum",
    name: "Flagellum",
    aliases: ["flagella", "bacterial flagellum"],
    cells: ["bacteria"],
    difficulty: 1,
    fn: "Long whip-like rotary appendage anchored in the cell envelope that propels the bacterium through liquid.",
  },
  {
    id: "pili",
    name: "Pili",
    aliases: ["pilus", "fimbriae", "fimbria"],
    cells: ["bacteria"],
    difficulty: 3,
    fn: "Short hair-like protein projections on the bacterial surface used for adhesion and DNA conjugation.",
  },
];

export const PARTS: readonly CellPart[] = RAW_PARTS.map((p) => ({
  ...p,
  label: p.name,
}));

const PART_BY_ID = new Map<string, CellPart>(PARTS.map((p) => [p.id, p]));

export function getPart(id: string): CellPart {
  const part = PART_BY_ID.get(id);
  if (!part) {
    throw new Error(`Unknown cell part id: "${id}"`);
  }
  return part;
}

export function partsForCell(
  cell: CellType,
  maxDifficulty: 1 | 2 | 3 = 3,
): CellPart[] {
  return PARTS.filter(
    (p) => p.cells.includes(cell) && p.difficulty <= maxDifficulty,
  );
}

