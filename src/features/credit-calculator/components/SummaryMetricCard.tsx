import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SummaryMetricCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tooltip?: ReactNode;
  emphasis?: boolean;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning" | "neutral";
}

const ACCENT_STYLES: Record<NonNullable<SummaryMetricCardProps["accent"]>, string> = {
  primary: "before:bg-primary-500",
  success: "before:bg-success",
  warning: "before:bg-warning",
  neutral: "before:bg-border-strong",
};

export function SummaryMetricCard({
  label,
  value,
  hint,
  tooltip,
  emphasis = false,
  icon,
  accent = "neutral",
}: SummaryMetricCardProps) {
  const inner = (
    <div
      className={cn(
        "relative h-full rounded-lg border border-border bg-surface",
        "pl-3 pr-2.5 py-2 sm:py-2.5",
        "flex flex-col gap-1 overflow-hidden min-w-0",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px]",
        ACCENT_STYLES[accent],
        emphasis &&
          "border-primary-200 bg-gradient-to-br from-primary-50 to-surface"
      )}
    >
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-foreground-muted truncate">
          {label}
        </div>
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 text-foreground-subtle",
              emphasis && "text-primary-600"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "tabular-nums text-base sm:text-lg font-semibold leading-tight text-foreground",
          "whitespace-nowrap truncate"
        )}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
      {hint ? (
        <div className="text-[11px] text-foreground-subtle leading-tight truncate">
          {hint}
        </div>
      ) : null}
    </div>
  );
  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        {inner}
      </Tooltip>
    );
  }
  return inner;
}