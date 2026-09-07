"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible tooltip that appears on hover or focus.
 * Renders the trigger inline and positions the tooltip absolutely above it.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span
      className={cn(
        "group relative inline-flex items-center",
        className
      )}
      tabIndex={0}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "invisible opacity-0 group-hover:visible group-hover:opacity-100",
          "group-focus-visible:visible group-focus-visible:opacity-100",
          "transition-opacity pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
          "w-60 rounded-md border border-border bg-surface px-3 py-2 text-xs leading-snug text-foreground shadow-md",
          "text-left"
        )}
      >
        {label}
      </span>
    </span>
  );
}