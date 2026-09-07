"use client";

import {
  Banknote,
  Calendar,
  Coins,
  Percent,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { formatCurrency, formatPercent } from "../utils/format";
import type { CreditCalculationResult } from "../types";
import { getCreditTypeDefaults } from "../services/credit-types";

interface CreditSummaryProps {
  result: CreditCalculationResult | null;
}

export function CreditSummary({ result }: CreditSummaryProps) {
  if (!result) {
    return (
      <Card className="no-print">
        <CardHeader>
          <CardTitle>Sonuç Özeti</CardTitle>
          <p className="text-sm text-foreground-muted">
            Hesaplama yapıldıktan sonra özet burada görüntülenir.
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[68px] rounded-lg border border-border bg-surface-muted/40 animate-pulse"
              />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  const creditLabel = getCreditTypeDefaults(result.input.creditType).label;
  const totalTax = result.totalKkdf + result.totalBsmv;
  const grandTotal = result.totalRepayment + result.totalFees;

  return (
    <Card className="no-print">
      <CardHeader className="space-y-0.5">
        <CardTitle>Sonuç Özeti</CardTitle>
        <p className="text-sm text-foreground-muted">
          {creditLabel} için hesaplama sonuçları aşağıdadır.
        </p>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <SummaryMetricCard
            label="Aylık Taksit"
            value={`${formatCurrency(result.monthlyPayment)} ₺`}
            emphasis
            accent="primary"
            icon={<Wallet className="h-3.5 w-3.5" />}
          />
          <SummaryMetricCard
            label="Toplam Geri Ödeme"
            value={`${formatCurrency(result.totalRepayment)} ₺`}
            hint={
              result.totalFees > 0
                ? `+ ${formatCurrency(result.totalFees)} ₺ ek maliyet`
                : undefined
            }
            accent="primary"
            icon={<Banknote className="h-3.5 w-3.5" />}
          />
          <SummaryMetricCard
            label="Toplam Faiz"
            value={`${formatCurrency(result.totalInterest)} ₺`}
            accent="warning"
            icon={<Percent className="h-3.5 w-3.5" />}
          />
          <SummaryMetricCard
            label="Vergi ve Fonlar"
            value={`${formatCurrency(totalTax)} ₺`}
            hint={`KKDF ${formatCurrency(result.totalKkdf)} + BSMV ${formatCurrency(result.totalBsmv)}`}
            accent="neutral"
            icon={<Receipt className="h-3.5 w-3.5" />}
          />
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <SummaryMetricCard
            label="Aylık Maliyet Oranı"
            value={`%${formatPercent(result.monthlyCostRate * 100)}`}
            accent="warning"
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            tooltip="Faiz ile faiz üzerinden hesaplanan vergi ve fonların dönemsel toplam etkisini gösterir."
          />
          <SummaryMetricCard
            label="Yıllık Efektif Maliyet"
            value={`%${formatPercent(result.annualEffectiveCostRate * 100, 2)}`}
            accent="warning"
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            tooltip="Aylık maliyet oranının bileşik yıllık karşılığıdır."
          />
          <SummaryMetricCard
            label="Toplam Anapara"
            value={`${formatCurrency(result.totalPrincipal)} ₺`}
            accent="success"
            icon={<Coins className="h-3.5 w-3.5" />}
          />
          <SummaryMetricCard
            label="Vade"
            value={`${result.input.termMonths} Ay`}
            accent="neutral"
            icon={<Calendar className="h-3.5 w-3.5" />}
          />
        </div>

        {result.totalFees > 0 ? (
          <>
            <Separator className="my-4" />
            <div className="rounded-md bg-primary-50/60 border border-primary-100 px-4 py-3 text-sm text-foreground-muted">
              <span className="text-foreground font-medium">
                {formatCurrency(grandTotal)} ₺
              </span>{" "}
              toplam maliyet (kredi geri ödemesi + ek masraflar).
            </div>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
}