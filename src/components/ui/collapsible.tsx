"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({
  title,
  description,
  defaultOpen = false,
  children,
  className,
}: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "rounded-lg"
        )}
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {description ? (
            <div className="text-xs text-foreground-muted mt-0.5">
              {description}
            </div>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform shrink-0",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="px-4 pb-4 pt-1 border-t border-border">{children}</div>
      ) : null}
    </div>
  );
}