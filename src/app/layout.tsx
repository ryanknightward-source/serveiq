import type { Metadata, Viewport } from "next";
import { Nunito, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-barlow",
});

const siteUrl = "https://ryanwardbaseball.com";

export const metadata: Metadata = {
  title: {
    default: "Ryan Ward Baseball — Private Lessons in Coronado, CA",
    template: "%s | Ryan Ward Baseball",
  },
  description:
    "Private baseball lessons with former D1 collegiate player Ryan Ward (University of Arkansas, University of San Diego). All ages. Hitting, fielding, throwing, footwork. Based in Coronado, CA.",
  applicationName: "Ryan Ward Baseball",
  formatDetection: { telephone: false },
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Ryan Ward Baseball",
    title: "Ryan Ward Baseball — Private Lessons in Coronado, CA",
    description:
      "Private baseball lessons with a former D1 collegiate player. All ages welcome. Book online.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Ryan Ward Baseball — Private Lessons in Coronado, CA",
    description:
      "Private baseball lessons with former D1 player Ryan Ward. Coronado, CA. All ages.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
