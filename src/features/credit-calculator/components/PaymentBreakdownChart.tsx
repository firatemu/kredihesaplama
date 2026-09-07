"use client";

import { formatCurrency } from "../utils/format";
import type { CreditCalculationResult } from "../types";

interface PaymentBreakdownChartProps {
  result: CreditCalculationResult;
}

const COLORS = {
  principal: "var(--color-chart-1)",
  interest: "var(--color-chart-2)",
  kkdf: "var(--color-chart-3)",
  bsmv: "var(--color-chart-4)",
  fees: "var(--color-chart-5)",
};

interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

/** Compact cost breakdown — bar list only (no oversized pie). */
export function PaymentBreakdownChart({ result }: PaymentBreakdownChartProps) {
  const items: BreakdownItem[] = [
    {
      name: "Anapara",
      value: result.totalPrincipal,
      color: COLORS.principal,
    },
    {
      name: "Faiz",
      value: result.totalInterest,
      color: COLORS.interest,
    },
    {
      name: "KKDF",
      value: result.totalKkdf,
      color: COLORS.kkdf,
    },
    {
      name: "BSMV",
      value: result.totalBsmv,
      color: COLORS.bsmv,
    },
    ...(result.totalFees > 0
      ? [
          {
            name: "Ek maliyet",
            value: result.totalFees,
            color: COLORS.fees,
          },
        ]
      : []),
  ].filter((d) => d.value > 0);

  const total = items.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="no-print rounded-lg border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)] h-full">
      <h3 className="text-sm font-semibold text-foreground">Maliyet dağılımı</h3>
      <ul className="mt-2.5 space-y-2">
        {items.map((d) => {
          const ratio = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <li key={d.name} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-foreground-muted min-w-0">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="tabular-nums text-foreground shrink-0">
                  {formatCurrency(d.value)} ₺
                  <span className="ml-1 text-foreground-subtle">
                    ({ratio.toFixed(1).replace(".", ",")}%)
                  </span>
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(ratio, 1)}%`,
                    background: d.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
