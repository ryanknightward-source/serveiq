import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Try ServeIQ live — send a test message and watch the AI respond in your business's voice.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
