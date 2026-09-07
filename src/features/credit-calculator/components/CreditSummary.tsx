"use client";

import { formatCurrency, formatPercent } from "../utils/format";
import type { CreditCalculationResult } from "../types";
import { getCreditTypeDefaults } from "../services/credit-types";

interface CreditSummaryProps {
  result: CreditCalculationResult | null;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-border pl-3 first:border-l-0 first:pl-0">
      <p className="text-[11px] leading-tight text-foreground-muted truncate">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground truncate">
        {value}
      </p>
    </div>
  );
}

export function CreditSummary({ result }: CreditSummaryProps) {
  if (!result) {
    return (
      <div className="no-print rounded-lg border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
        <div className="h-3 w-28 rounded bg-surface-muted animate-pulse" />
        <div className="mt-2 h-8 w-40 rounded bg-surface-muted animate-pulse" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded bg-surface-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const creditLabel = getCreditTypeDefaults(result.input.creditType).label;
  const totalTax = result.totalKkdf + result.totalBsmv;

  return (
    <div className="no-print rounded-lg border border-border bg-surface px-4 py-3 sm:px-5 sm:py-3.5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-primary-600">
            {creditLabel}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">Aylık taksit</p>
          <p className="mt-0.5 text-3xl font-semibold tracking-tight text-foreground tabular-nums leading-none">
            {formatCurrency(result.monthlyPayment)}
            <span className="ml-1.5 text-sm font-medium text-foreground-muted">
              ₺ / ay
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-y-2 gap-x-4 sm:grid-cols-4">
        <MiniMetric
          label="Toplam geri ödeme"
          value={`${formatCurrency(result.totalRepayment)} ₺`}
        />
        <MiniMetric
          label="Toplam faiz"
          value={`${formatCurrency(result.totalInterest)} ₺`}
        />
        <MiniMetric
          label="Toplam vergi"
          value={`${formatCurrency(totalTax)} ₺`}
        />
        <MiniMetric
          label="Yıllık maliyet"
          value={`%${formatPercent(result.annualEffectiveCostRate * 100, 2)}`}
        />
      </div>
    </div>
  );
}
