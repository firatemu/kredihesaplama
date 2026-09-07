"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex w-full h-11 appearance-none rounded-md border border-input bg-surface",
            "pl-3 pr-9 text-sm text-foreground",
            "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            invalid && "border-danger focus:border-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted"
          aria-hidden="true"
        />
      </div>
    );
  }
);