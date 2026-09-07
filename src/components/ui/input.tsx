import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  invalid?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, type = "text", invalid, prefix, suffix, ...props },
    ref
  ) {
    const hasAffix = prefix != null || suffix != null;
    return (
      <div
        className={cn(
          "relative flex w-full items-center",
          hasAffix &&
            "rounded-md border border-input bg-surface focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
          invalid && "border-danger focus-within:border-danger",
          className
        )}
      >
        {prefix ? (
          <span className="pl-3 pr-1 text-sm text-foreground-muted select-none">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          type={type}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-sm text-foreground",
            "placeholder:text-foreground-subtle",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "tabular-nums",
            hasAffix ? "h-11 px-3" : "h-11 px-3 rounded-md border border-input",
            !hasAffix && invalid && "border-danger",
            !hasAffix && "focus:border-ring focus:ring-2 focus:ring-ring/20"
          )}
          {...props}
        />
        {suffix ? (
          <span className="pl-1 pr-3 text-sm text-foreground-muted select-none">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  }
);