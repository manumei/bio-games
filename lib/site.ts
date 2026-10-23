export interface SocialLinks {
  instagram?: string;
  x?: string;
  discord?: string;
}

export const SITE_CONFIG = {
  name: "BioGames",
  tagline: "BioGames | Play and Learn",
  url: "https://bio-games.vercel.app",
  gaId: "G-SR2881QNM3",
  contactEmail: "biogames435@gmail.com",
  // [USER DECISION] Default placeholder URLs preserved per B4
  social: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    discord: "https://discord.com",
  } satisfies SocialLinks,
  creator: {
    name: "Manuel Meiriño",
    url: "https://www.linkedin.com/in/manuel-meiri%C3%B1o-7b9214331/",
  },
  inspiration: {
    name: "futbol-11.com",
    url: "https://futbol-11.com",
  },
} as const;
