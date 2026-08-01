import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Cancelled",
};

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
