"use client";

import { formatCurrency, formatPercent } from "../utils/format";
import type { CreditCalculationResult } from "../types";
import { getCreditTypeDefaults } from "../services/credit-types";

interface CreditSummaryProps {
  result: CreditCalculationResult | null;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/50 px-3 py-2.5 min-w-0">
      <p className="text-xs text-foreground-muted truncate">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground truncate">
        {value}
      </p>
    </div>
  );
}

export function CreditSummary({ result }: CreditSummaryProps) {
  if (!result) {
    return (
      <div className="no-print rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="h-3 w-24 rounded bg-surface-muted animate-pulse" />
        <div className="mt-4 h-4 w-28 rounded bg-surface-muted animate-pulse" />
        <div className="mt-3 h-12 w-48 rounded bg-surface-muted animate-pulse" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[58px] rounded-lg border border-border bg-surface-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const creditLabel = getCreditTypeDefaults(result.input.creditType).label;
  const totalTax = result.totalKkdf + result.totalBsmv;

  return (
    <div className="no-print rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
        {creditLabel}
      </p>
      <p className="mt-2 text-sm text-foreground-muted">Aylık taksit</p>
      <p className="mt-1 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground tabular-nums transition-all duration-200">
        {formatCurrency(result.monthlyPayment)}
        <span className="ml-2 text-lg font-medium text-foreground-muted">
          ₺ / ay
        </span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
