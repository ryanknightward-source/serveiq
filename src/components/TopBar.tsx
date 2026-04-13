"use client";

import Image from "next/image";
import Link from "next/link";
import { useBusinessConfig } from "@/lib/useBusinessConfig";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function TopBar({ title }: { title?: string }) {
  const { config, loaded } = useBusinessConfig();
  const businessName = config.businessName || "Your Business";

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between gap-3 px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <SidebarTrigger className="text-gray-600 hover:text-gray-900 shrink-0" />
        <Link
          href="/dashboard"
          aria-label="ServeIQ dashboard"
          className="shrink-0 md:hidden"
        >
          <Image
            src="/serveiq-logo.png"
            alt="ServeIQ"
            width={390}
            height={260}
            priority
            className="h-7 w-auto"
          />
        </Link>
        {loaded ? (
          <h1 className="font-semibold text-[15px] text-gray-900 truncate">
            {businessName}
          </h1>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
        {title && (
          <>
            <span className="text-gray-300 shrink-0 hidden sm:inline">/</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">
              {title}
            </span>
          </>
        )}
      </div>

      <Badge
        variant="emerald"
        className="gap-2 rounded-full px-2.5 py-1.5 text-[11px] normal-case tracking-normal shrink-0"
      >
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-dot" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>AI Active</span>
      </Badge>
    </header>
  );
}
