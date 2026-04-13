import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Follow-Ups",
};

export default function FollowUpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
