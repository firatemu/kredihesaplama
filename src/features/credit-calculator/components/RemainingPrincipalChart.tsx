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
    <div className="no-print rounded-lg border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)] h-full">
      <h3 className="text-sm font-semibold text-foreground">Kalan anapara</h3>
      <div className="mt-2 h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
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
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="installment"
              stroke="var(--color-foreground-subtle)"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-foreground-subtle)"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) =>
                new Intl.NumberFormat("tr-TR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(Number(v))
              }
              width={36}
              tickLine={false}
              axisLine={false}
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
                "Kalan",
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
              strokeWidth={1.75}
              fill="url(#remainingGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
