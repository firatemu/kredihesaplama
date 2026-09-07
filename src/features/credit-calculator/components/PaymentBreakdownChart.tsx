"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
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
  /** Optional label override for the rendered list */
  displayName?: string;
}

export function PaymentBreakdownChart({ result }: PaymentBreakdownChartProps) {
  const items: BreakdownItem[] = [
    {
      name: "Anapara",
      displayName: "Anapara",
      value: result.totalPrincipal,
      color: COLORS.principal,
    },
    {
      name: "Faiz",
      displayName: "Toplam Faiz",
      value: result.totalInterest,
      color: COLORS.interest,
    },
    {
      name: "KKDF",
      displayName: "Toplam KKDF",
      value: result.totalKkdf,
      color: COLORS.kkdf,
    },
    {
      name: "BSMV",
      displayName: "Toplam BSMV",
      value: result.totalBsmv,
      color: COLORS.bsmv,
    },
    ...(result.totalFees > 0
      ? [
          {
            name: "Ek Maliyet",
            displayName: "Ek Maliyetler",
            value: result.totalFees,
            color: COLORS.fees,
          } satisfies BreakdownItem,
        ]
      : []),
  ].filter((d) => d.value > 0);

  const total = items.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card className="no-print">
      <CardHeader className="space-y-0.5">
        <CardTitle>Toplam Maliyet Dağılımı</CardTitle>
        <p className="text-sm text-foreground-muted">
          Kredi bileşenlerinin toplam geri ödemeye oranı.
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="h-[240px] sm:h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="var(--color-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                label={false}
              >
                {items.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                itemStyle={{ padding: 0 }}
                formatter={(value, name) => {
                  const v = Number(value);
                  const pct = total > 0 ? (v / total) * 100 : 0;
                  return [
                    `${formatCurrency(v)} ₺ (${pct.toFixed(2).replace(".", ",")}%)`,
                    String(name),
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-1.5 text-sm w-full">
          {items.map((d) => {
            const ratio = total > 0 ? (d.value / total) * 100 : 0;
            return (
              <li
                key={d.name}
                className="flex items-center justify-between gap-2 sm:gap-3 rounded-md px-2 py-1.5 hover:bg-surface-muted/60 transition-colors min-w-0"
              >
                <span className="inline-flex items-center gap-2 min-w-0 flex-1">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-sm shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-foreground truncate">
                    {d.displayName ?? d.name}
                  </span>
                </span>
                <span className="tabular-nums text-right text-foreground-muted leading-tight shrink-0">
                  <span className="block">{formatCurrency(d.value)} ₺</span>
                  <span className="block text-[11px] text-foreground-subtle">
                    {ratio.toFixed(2).replace(".", ",")}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}