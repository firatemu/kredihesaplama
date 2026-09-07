"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "../utils/format";
import type { PaymentScheduleItem } from "../types";
import { cn } from "@/lib/utils";

interface PaymentScheduleTableProps {
  schedule: PaymentScheduleItem[];
  showHeader?: boolean;
  totalRow?: {
    payment: number;
    principal: number;
    interest: number;
    kkdf: number;
    bsmv: number;
  };
}

const HEADERS = [
  "No",
  "Ödeme Tarihi",
  "Taksit Tutarı",
  "Anapara",
  "Faiz",
  "KKDF",
  "BSMV",
  "Kalan Anapara",
];

export function PaymentScheduleTable({
  schedule,
  showHeader = true,
  totalRow,
}: PaymentScheduleTableProps) {
  const totals = useMemo(() => {
    if (!totalRow) {
      return schedule.reduce(
        (acc, row) => ({
          payment: acc.payment + row.payment,
          principal: acc.principal + row.principal,
          interest: acc.interest + row.interest,
          kkdf: acc.kkdf + row.kkdf,
          bsmv: acc.bsmv + row.bsmv,
        }),
        { payment: 0, principal: 0, interest: 0, kkdf: 0, bsmv: 0 }
      );
    }
    return totalRow;
  }, [schedule, totalRow]);

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="min-w-[820px] w-full text-sm tabular-nums">
        <thead className="bg-surface-muted/80 sticky top-0 z-[1]">
          <tr>
            {HEADERS.map((h, i) => (
              <th
                key={h}
                className={cn(
                  "px-3 py-2 text-left font-semibold text-foreground-muted border-b border-border",
                  i >= 2 && "text-right"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr
              key={row.installmentNo}
              className="odd:bg-surface even:bg-surface-muted/40 hover:bg-primary-50/40 transition-colors"
            >
              <td className="px-3 py-2 border-b border-border text-foreground-muted">
                {row.installmentNo}
              </td>
              <td className="px-3 py-2 border-b border-border">
                {formatDate(row.paymentDate)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right font-semibold text-foreground">
                {formatCurrency(row.payment)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right">
                {formatCurrency(row.principal)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right">
                {formatCurrency(row.interest)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right">
                {formatCurrency(row.kkdf)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right">
                {formatCurrency(row.bsmv)}
              </td>
              <td className="px-3 py-2 border-b border-border text-right">
                {formatCurrency(row.remainingPrincipal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-surface-muted font-semibold text-foreground">
            <td className="px-3 py-2 border-t border-border" colSpan={2}>
              TOPLAM
            </td>
            <td className="px-3 py-2 border-t border-border text-right">
              {formatCurrency(totals.payment)}
            </td>
            <td className="px-3 py-2 border-t border-border text-right">
              {formatCurrency(totals.principal)}
            </td>
            <td className="px-3 py-2 border-t border-border text-right">
              {formatCurrency(totals.interest)}
            </td>
            <td className="px-3 py-2 border-t border-border text-right">
              {formatCurrency(totals.kkdf)}
            </td>
            <td className="px-3 py-2 border-t border-border text-right">
              {formatCurrency(totals.bsmv)}
            </td>
            <td className="px-3 py-2 border-t border-border" />
          </tr>
        </tfoot>
      </table>
      {showHeader ? null : null}
    </div>
  );
}

interface PaymentScheduleMobileCardsProps {
  schedule: PaymentScheduleItem[];
}

export function PaymentScheduleMobileCards({
  schedule,
}: PaymentScheduleMobileCardsProps) {
  return (
    <ul className="space-y-2">
      {schedule.map((row) => (
        <MobileScheduleRow key={row.installmentNo} row={row} />
      ))}
    </ul>
  );
}

function MobileScheduleRow({ row }: { row: PaymentScheduleItem }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-lg border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tabular-nums">
              {row.installmentNo}
            </span>
            <span>{formatDate(row.paymentDate)}</span>
          </div>
          <div className="mt-1 text-sm text-foreground-muted">
            Taksit:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatCurrency(row.payment)} ₺
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />
        )}
      </button>
      {open ? (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-surface-muted/40">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <DetailRow label="Anapara" value={row.principal} />
            <DetailRow label="Faiz" value={row.interest} />
            <DetailRow label="KKDF" value={row.kkdf} />
            <DetailRow label="BSMV" value={row.bsmv} />
            <DetailRow
              label="Kalan Anapara"
              value={row.remainingPrincipal}
              className="col-span-2"
            />
          </dl>
        </div>
      ) : null}
    </li>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <Fragment>
      <dt className={cn("text-foreground-muted", className)}>{label}</dt>
      <dd className={cn("tabular-nums text-foreground", className)}>
        {formatCurrency(value)} ₺
      </dd>
    </Fragment>
  );
}

interface PaymentScheduleProps {
  schedule: PaymentScheduleItem[];
  totalRow?: {
    payment: number;
    principal: number;
    interest: number;
    kkdf: number;
    bsmv: number;
  };
  /** Optional action element (e.g. export buttons) rendered inside the header. */
  headerAction?: React.ReactNode;
}

export function PaymentSchedule({
  schedule,
  totalRow,
  headerAction,
}: PaymentScheduleProps) {
  return (
    <Card className="print-area">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-0.5 min-w-0">
          <CardTitle>Ödeme Planı</CardTitle>
          <p className="text-sm text-foreground-muted">
            Her taksit için ayrıntılı anapara, faiz ve vergi dökümü.
          </p>
        </div>
        {headerAction ? (
          <div className="shrink-0 no-print">{headerAction}</div>
        ) : null}
      </CardHeader>
      <CardBody>
        {/* Desktop / tablet: full table */}
        <div className="hidden md:block">
          <PaymentScheduleTable schedule={schedule} totalRow={totalRow} />
        </div>
        {/* Mobile: collapsible cards */}
        <div className="md:hidden">
          <PaymentScheduleMobileCards schedule={schedule} />
        </div>
      </CardBody>
    </Card>
  );
}