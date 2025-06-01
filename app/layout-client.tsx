"use client";
import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Script from "next/script";
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
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SR2881QNM3"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SR2881QNM3');
          `}
        </Script>
      </head>
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
