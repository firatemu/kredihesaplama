import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field id used to wire label htmlFor. */
  id?: string;
  error?: string;
  hint?: string;
}

export function Field({
  className,
  error,
  hint,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-foreground-subtle">{hint}</p>
      ) : null}
    </div>
  );
}