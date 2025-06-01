"use client";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";

const FigtreeSans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    ReactGA.initialize("G-XXXXXXXXXX"); // Replace with actual ID
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <html lang="en">
      <body
        className={`${FigtreeSans.variable} antialiased bg-custom-2 text-white`}
      >
        <Header />
        <div className="bg-custom-2">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
