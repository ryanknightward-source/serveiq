import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
});

const siteUrl = "https://getserveiq.net";

export const metadata: Metadata = {
  title: {
    default: "ServeIQ — AI lead response for service businesses",
    template: "%s | ServeIQ",
  },
  description:
    "AI-powered SMS and email automation for pest control and pool service companies. Respond to leads, follow up cold quotes, and re-engage lapsed customers automatically.",
  applicationName: "ServeIQ",
  formatDetection: { telephone: false },
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "ServeIQ",
    title: "ServeIQ — AI lead response for service businesses",
    description:
      "AI-powered SMS and email automation for pest control and pool service companies. Respond to leads, follow up cold quotes, and re-engage lapsed customers automatically.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "ServeIQ — AI lead response for service businesses",
    description:
      "AI-powered SMS and email automation for pest control and pool service companies.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
