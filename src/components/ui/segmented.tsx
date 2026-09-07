"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  fullWidth = false,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface p-0.5 min-w-0",
        fullWidth && "flex w-full",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-1.5 sm:px-3 h-9 min-h-[44px] sm:min-h-[36px] text-[11px] sm:text-sm rounded-[6px] font-medium",
              "transition-colors duration-150 leading-tight text-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "bg-primary-600 text-white shadow-sm"
                : "text-foreground-muted hover:text-foreground",
              fullWidth && "flex-1 min-w-0"
            )}
          >
            <span className="block truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
