import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SITE_CONFIG } from "@/lib/site";
import "./globals.css";

const FigtreeSans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.tagline,
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    shortcut: "/favicon_io/favicon-32x32.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/assets/img/covers/og-image.webp",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
      <head>
        {isProduction && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.gaId}`}
            />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${SITE_CONFIG.gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${FigtreeSans.variable} antialiased bg-page text-white`}>
        <Header />
        {children}
        <Footer />
        {isProduction && <Analytics />}
      </body>
    </html>
  );
}
