"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportCreditPlanPdf } from "../services/exports/pdf-export";
import { exportCreditPlanExcel } from "../services/exports/excel-export";
import type { CreditCalculationInput, CreditCalculationResult } from "../types";

interface ExportActionsProps {
  input: CreditCalculationInput;
  result: CreditCalculationResult;
  disabled?: boolean;
  /** Compact mode hides button labels and keeps icon-only width. */
  compact?: boolean;
  className?: string;
}

export function ExportActions({
  input,
  result,
  disabled = false,
  compact = false,
  className,
}: ExportActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const handlePdf = async () => {
    if (disabled) return;
    try {
      setPdfLoading(true);
      await exportCreditPlanPdf({ input, result });
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcel = () => {
    if (disabled) return;
    try {
      setExcelLoading(true);
      exportCreditPlanExcel({ input, result });
    } catch (error) {
      console.error("Excel export failed", error);
    } finally {
      setExcelLoading(false);
    }
  };

  const handlePrint = () => {
    if (disabled) return;
    window.print();
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handlePdf}
        loading={pdfLoading}
        disabled={disabled}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {compact
          ? pdfLoading
            ? "PDF"
            : "PDF İndir"
          : pdfLoading
            ? "PDF hazırlanıyor..."
            : "PDF İndir"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handleExcel}
        loading={excelLoading}
        disabled={disabled}
      >
        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
        {excelLoading ? "Excel" : "Excel İndir"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={compact ? "sm" : "md"}
        onClick={handlePrint}
        disabled={disabled}
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Yazdır
      </Button>
    </div>
  );
}