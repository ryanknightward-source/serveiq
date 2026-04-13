import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServeIQ — AI lead response for service businesses",
  description:
    "AI-powered SMS and email automation for pest control and pool service companies. Respond to leads, follow up cold quotes, and re-engage lapsed customers automatically.",
  applicationName: "ServeIQ",
  formatDetection: { telephone: false },
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
