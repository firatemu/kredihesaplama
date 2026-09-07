"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "../utils/format";
import type { PaymentScheduleItem } from "../types";

interface RemainingPrincipalChartProps {
  schedule: PaymentScheduleItem[];
}

export function RemainingPrincipalChart({
  schedule,
}: RemainingPrincipalChartProps) {
  const data = schedule.map((row) => ({
    installment: row.installmentNo,
    remaining: row.remainingPrincipal,
    date: row.paymentDate,
  }));

  return (
    <Card className="no-print">
      <CardHeader className="space-y-0.5">
        <CardTitle>Vade Boyunca Kalan Anapara</CardTitle>
        <p className="text-sm text-foreground-muted">
          Her taksit sonrası kalan anapara grafiği.
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="remainingGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="installment"
                stroke="var(--color-foreground-subtle)"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                label={{
                  value: "Taksit No",
                  position: "insideBottom",
                  offset: -2,
                  fill: "var(--color-foreground-muted)",
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="var(--color-foreground-subtle)"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("tr-TR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v))
                }
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `${formatCurrency(Number(value))} ₺`,
                  "Kalan Anapara",
                ]}
                labelFormatter={(label, payload) => {
                  const row = payload?.[0]?.payload as
                    | { date?: Date }
                    | undefined;
                  return row?.date
                    ? formatDate(row.date)
                    : `Taksit ${String(label)}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="remaining"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#remainingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}