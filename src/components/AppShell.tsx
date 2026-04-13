"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-gray-50">
        <TopBar title={title} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
