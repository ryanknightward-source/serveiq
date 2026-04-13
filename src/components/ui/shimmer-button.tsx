import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-start overflow-hidden whitespace-normal rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 transition-colors hover:border-amber-300 hover:bg-amber-50/30 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {/* Shimmer overlay — hover only */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-200/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-[shimmer_1.2s_ease-in-out_once] group-hover:opacity-100" />
        <span className="relative">{children}</span>
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
