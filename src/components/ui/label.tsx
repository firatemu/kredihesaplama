import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  tooltip?: React.ReactNode;
  htmlFor: string;
}

export function Label({
  className,
  required,
  tooltip,
  htmlFor,
  children,
  ...props
}: LabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium text-foreground-muted select-none",
          className
        )}
        {...props}
      >
        {children}
        {required ? (
          <span aria-hidden="true" className="text-danger ml-0.5">
            *
          </span>
        ) : null}
      </label>
      {tooltip ? (
        <span
          className="group relative inline-flex items-center"
          tabIndex={0}
          aria-label="Bilgi"
        >
          <Info className="h-3.5 w-3.5 text-foreground-subtle cursor-help" />
          <span
            role="tooltip"
            className={cn(
              "invisible opacity-0 group-hover:visible group-hover:opacity-100",
              "group-focus-visible:visible group-focus-visible:opacity-100",
              "transition-opacity pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 z-50",
              "w-56 rounded-md border border-border bg-surface px-3 py-2 text-xs leading-snug text-foreground shadow-md",
              "text-left"
            )}
          >
            {tooltip}
          </span>
        </span>
      ) : null}
    </div>
  );
}