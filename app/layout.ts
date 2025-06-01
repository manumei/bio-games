import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BioGames",
  description: "BioGames | Play and Learn",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    shortcut: "/favicon_io/favicon-32x32.png",
  },
  manifest: "/favicon_io/site.webmanifest",
}

export { default } from "./layout-client"
