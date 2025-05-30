import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const FigtreeSans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree-sans",
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${FigtreeSans.variable} antialiased bg-custom-2 text-white`}
      >
        <Header />
        <div className="bg-custom-2">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
