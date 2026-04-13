"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  Sparkles,
  Tag,
} from "lucide-react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/follow-ups", label: "Follow-Ups", icon: MessageSquare },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/setup", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <ShadcnSidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
            <Image
              src="/serveiq-mark.svg"
              alt="ServeIQ"
              width={28}
              height={28}
              priority
            />
          </div>
          <div>
            <div className="font-semibold text-[15px] tracking-tight text-sidebar-foreground">
              Serve<span className="text-amber-500">IQ</span>
            </div>
            <div className="text-[11px] text-sidebar-foreground/40 -mt-0.5">
              AI lead response
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/dashboard" && pathname?.startsWith(href));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={!!active}
                      className="text-sidebar-foreground/70 data-[active=true]:text-sidebar-foreground"
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Link
          href="/demo"
          className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-black/20"
        >
          <Sparkles className="w-4 h-4" />
          Try the demo
        </Link>
        <div className="px-3 text-[11px] text-sidebar-foreground/30">
          v0.1 · Preview
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
