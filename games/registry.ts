import type { Metadata } from "next";

export type GameStatus = "live" | "coming-soon";

export interface GameMeta {
  slug: string;
  title: string;
  brand: [accent: string, rest: string];
  description: string;
  status: GameStatus;
  isNew?: boolean;
  cover?: { card: string; menu: string };
  daily?: boolean;
}

export const GAMES: readonly GameMeta[] = [
  {
    slug: "taxo-bingo",
    title: "Taxo Bingo",
    brand: ["TAXO", "BINGO"],
    description:
      "Match organisms to the 12 taxonomic categories on the bingo grid.",
    status: "live",
    isNew: true,
    daily: true,
    cover: {
      card: "/assets/img/covers/home/taxo.png",
      menu: "/assets/img/covers/menu/taxo.png",
    },
  },
  {
    slug: "bio-wordle",
    title: "Bio Wordle",
    brand: ["BIO", "WORDLE"],
    description: "Guess the secret biology word in six tries.",
    status: "coming-soon",
  },
  {
    slug: "symptoms-link",
    title: "Symptoms Link",
    brand: ["SYMPTOMS", "LINK"],
    description:
      "Identify the pathogen or disease from progressively revealed symptoms.",
    status: "coming-soon",
  },
  {
    slug: "animal-tictactoe",
    title: "Animal Tic-Tac-Toe",
    brand: ["ANIMAL", "TIC-TAC-TOE"],
    description:
      "Claim cells on a trait-crossed grid in a biology twist on tic-tac-toe.",
    status: "coming-soon",
  },
  {
    slug: "bio-top8",
    title: "Bio Top 8",
    brand: ["BIO", "TOP 8"],
    description: "Find the top eight answers in a ranked biology category.",
    status: "coming-soon",
  },
  {
    slug: "cell-classifier",
    title: "Cell Classifier",
    brand: ["CELL", "CLASSIFIER"],
    description: "Identify organelles and cell structures across cell types.",
    status: "coming-soon",
  },
];

export function getGame(slug: string): GameMeta {
  const game = GAMES.find((entry) => entry.slug === slug);
  if (!game) {
    throw new Error(`Unknown game slug: "${slug}"`);
  }
  return game;
}

export function gameMetadata(slug: string): Metadata {
  const game = getGame(slug);
  return {
    title: game.title,
    description: game.description,
    openGraph: {
      title: `${game.title} | BioGames`,
      description: game.description,
      images: [game.cover?.card ?? "/assets/img/covers/og-image.webp"],
    },
  };
}
