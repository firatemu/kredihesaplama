/**
 * Excel (.xlsx) export using SheetJS.
 *
 * Produces a real workbook with a single consolidated sheet containing both
 * the loan summary and the payment schedule for an at-a-glance corporate
 * document. Numeric cells use the `#,##0.00 "₺"` format and dates use the
 * spreadsheet's built-in date type.
 */
import * as XLSX from "xlsx";
import type {
  CreditCalculationInput,
  CreditCalculationResult,
} from "../../types";
import { formatPercent } from "../../utils/format";
import { getCreditTypeDefaults } from "../credit-types";

interface ExcelExportInput {
  input: CreditCalculationInput;
  result: CreditCalculationResult;
}

const TL_FMT = '#,##0.00 "₺"';
const TL_FMT_INT = '#,##0 "₺"';
const PERCENT_FMT = "0.0000%";
const DATE_FMT = "dd.mm.yyyy";
const HEADER_FILL = "FF0F2547"; // navy
const BAND_FILL = "FFF1F5F9";   // slate-100
const TOTAL_FILL = "FFE2E8F0";   // slate-200

/** A minimal cell descriptor that mirrors the bits of XLSX's CellObject we use. */
interface ExcelCell {
  v: string | number | Date;
  t: "s" | "n" | "b" | "d" | "e";
  z?: string;
  s?: {
    fill?: { fgColor?: { rgb?: string } };
    font?: { bold?: boolean; color?: { rgb?: string }; italic?: boolean };
  };
}

const S_TITLE: ExcelCell["s"] = {
  fill: { fgColor: { rgb: HEADER_FILL } },
  font: { bold: true, color: { rgb: "FFFFFFFF" } },
};
const S_SUBTITLE: ExcelCell["s"] = {
  font: { color: { rgb: "FF1E3A8A" }, bold: true },
};
const S_META: ExcelCell["s"] = {
  font: { color: { rgb: "FF64748B" } },
};
const S_SECTION: ExcelCell["s"] = S_TITLE;
const S_HEADER: ExcelCell["s"] = { font: { bold: true } };
const S_LABEL: ExcelCell["s"] = {
  font: { bold: true, color: { rgb: "FF475569" } },
};
const S_BAND: ExcelCell["s"] = { fill: { fgColor: { rgb: BAND_FILL } } };
const S_TOTAL: ExcelCell["s"] = {
  fill: { fgColor: { rgb: TOTAL_FILL } },
  font: { bold: true, color: { rgb: "FF0F172A" } },
};
const S_DISCLAIMER: ExcelCell["s"] = {
  font: { color: { rgb: "FF94A3B8" }, italic: true },
};

function txt(s: string, sMeta: ExcelCell["s"] = undefined): ExcelCell {
  return { v: s, t: "s", s: sMeta };
}
function num(value: number, fmt: string = TL_FMT, sMeta: ExcelCell["s"] = undefined): ExcelCell {
  return { v: value, t: "n", z: fmt, s: sMeta };
}
function date(value: Date): ExcelCell {
  return { v: excelSerialFromDate(value), t: "n", z: DATE_FMT };
}

function buildWorkbook({
  input,
  result,
}: ExcelExportInput): XLSX.WorkBook {
  const creditLabel = getCreditTypeDefaults(input.creditType).label;
  const rateLabel =
    input.rateType === "monthly"
      ? "Aylık Faiz"
      : input.rateType === "annual_effective"
        ? "Yıllık Efektif"
        : "Yıllık Nominal";
  const totalTax = result.totalKkdf + result.totalBsmv;
  const totalWithFees = result.totalRepayment + result.totalFees;
  const totalExtraFees =
    (input.allocationFee ?? 0) +
    (input.insuranceFee ?? 0) +
    (input.otherFees ?? 0);

  // 8-column matrix; undefined cells are blank.
  const COLS = 8;
  const rows: ExcelCell[][] = [];
  const push = (...cells: Array<ExcelCell | undefined>) => {
    const row: ExcelCell[] = [];
    for (let i = 0; i < COLS; i++) row.push(cells[i] ?? { v: "", t: "s" });
    rows.push(row);
  };

  // --- Title -------------------------------------------------------------
  push(txt("KREDİ ÖDEME PLANI", S_TITLE));
  push(
    txt(
      `${creditLabel} · ${input.termMonths} ay · ${rateLabel} %${formatPercent(input.interestRate)}`,
      S_SUBTITLE
    )
  );
  push(txt(`Oluşturma: ${new Date().toLocaleString("tr-TR")}`, S_META));
  push(); // spacer

  // --- 01 Kredi Özeti ----------------------------------------------------
  push(txt("01 · KREDİ ÖZETİ", S_SECTION));
  push(txt("Alan", S_HEADER), txt("Değer", S_HEADER));
  const summaryItems: Array<[string, ExcelCell]> = [
    ["Kredi Türü", txt(creditLabel)],
    ["Kredi Tutarı", num(input.principal)],
    ["Vade", num(input.termMonths, "0")],
    ["Faiz Oranı Türü", txt(rateLabel)],
    ["Faiz Oranı", num(input.interestRate / 100, PERCENT_FMT)],
    ["KKDF Oranı", num(input.kkdfRate / 100, PERCENT_FMT)],
    ["BSMV Oranı", num(input.bsmvRate / 100, PERCENT_FMT)],
    ["İlk Taksit Tarihi", date(input.firstPaymentDate)],
    ["Tahsis Ücreti", num(input.allocationFee ?? 0)],
    ["Sigorta", num(input.insuranceFee ?? 0)],
    ["Diğer Masraflar", num(input.otherFees ?? 0)],
    ["Toplam Ek Maliyet", num(totalExtraFees)],
  ];
  for (const [label, val] of summaryItems) {
    push(txt(label, S_LABEL), val);
  }
  push(); // spacer

  // --- 02 Hesaplama Sonuçları ---------------------------------------------
  push(txt("02 · HESAPLAMA SONUÇLARI", S_SECTION));
  push(txt("Gösterge", S_HEADER), txt("Değer", S_HEADER));
  const resultItems: Array<[string, ExcelCell]> = [
    ["Aylık Taksit", num(result.monthlyPayment)],
    ["Toplam Anapara", num(result.totalPrincipal)],
    ["Toplam Faiz", num(result.totalInterest)],
    ["Toplam KKDF", num(result.totalKkdf)],
    ["Toplam BSMV", num(result.totalBsmv)],
    ["Toplam Vergi ve Fonlar", num(totalTax)],
    ["Toplam Geri Ödeme", num(result.totalRepayment)],
    ["Toplam Maliyet (ek masraflar dahil)", num(totalWithFees)],
    ["Aylık Maliyet Oranı", num(result.monthlyCostRate, PERCENT_FMT)],
    ["Yıllık Efektif Maliyet", num(result.annualEffectiveCostRate, PERCENT_FMT)],
    ["Taksit Sayısı", num(result.schedule.length, "0")],
  ];
  for (const [label, val] of resultItems) {
    push(txt(label, S_LABEL), val);
  }
  push(); // spacer

  // --- 03 Ödeme Planı ----------------------------------------------------
  push(txt("03 · ÖDEME PLANI", S_SECTION));
  push(
    txt("No", S_HEADER),
    txt("Ödeme Tarihi", S_HEADER),
    txt("Taksit Tutarı", S_HEADER),
    txt("Anapara", S_HEADER),
    txt("Faiz", S_HEADER),
    txt("KKDF", S_HEADER),
    txt("BSMV", S_HEADER),
    txt("Kalan Anapara", S_HEADER)
  );
  result.schedule.forEach((row, index) => {
    const band = index % 2 === 1 ? S_BAND : undefined;
    push(
      num(row.installmentNo, "0", band),
      date(row.paymentDate),
      num(row.payment, TL_FMT, band),
      num(row.principal, TL_FMT, band),
      num(row.interest, TL_FMT, band),
      num(row.kkdf, TL_FMT, band),
      num(row.bsmv, TL_FMT, band),
      num(row.remainingPrincipal, TL_FMT, band)
    );
  });

  // Total row
  push(
    txt("TOPLAM", S_TOTAL),
    { v: "", t: "s", s: S_TOTAL },
    num(result.totalRepayment, TL_FMT_INT, S_TOTAL),
    num(result.totalPrincipal, TL_FMT_INT, S_TOTAL),
    num(result.totalInterest, TL_FMT_INT, S_TOTAL),
    num(result.totalKkdf, TL_FMT_INT, S_TOTAL),
    num(result.totalBsmv, TL_FMT_INT, S_TOTAL),
    num(0, TL_FMT, S_TOTAL)
  );
  push(); // spacer
  push(
    txt(
      "Bu belge bilgilendirme amaçlıdır. Bankaların faiz, vergi ve masraf uygulamaları farklılık gösterebilir.",
      S_DISCLAIMER
    )
  );

  // Convert cell descriptors to the plain AOA expected by aoa_to_sheet, then
  // re-apply the styles via direct cell-address writes (which SheetJS supports).
  const aoa: Array<Array<string | number | Date>> = rows.map((row) =>
    row.map((c) => (c.v as string | number | Date))
  );
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Apply formats / styles per cell address.
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      const ref = ws[addr];
      if (!ref) return;
      ref.v = cell.v;
      ref.t = cell.t;
      if (cell.z) ref.z = cell.z;
      if (cell.s) ref.s = cell.s;
    });
  });

  // Column widths
  ws["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  // Merge title, subtitle, meta, and section rows across all 8 columns.
  const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = [];
  for (let r = 0; r < rows.length; r++) {
    const first = rows[r][0];
    const isTitleRow =
      first && typeof first.v === "string" && /KREDİ ÖDEME PLANI/.test(first.v);
    const isSubtitleRow =
      first && typeof first.v === "string" && /ay · /.test(first.v);
    const isMetaRow =
      first && typeof first.v === "string" && /Oluşturma: /.test(first.v);
    const isSectionRow =
      first && typeof first.v === "string" && /^\d{2}\s·/.test(first.v);
    if (isTitleRow || isSubtitleRow || isMetaRow || isSectionRow) {
      merges.push({ s: { r, c: 0 }, e: { r, c: COLS - 1 } });
    }
  }
  ws["!merges"] = merges;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kredi Ödeme Planı");
  return wb;
}

export function exportCreditPlanExcel({
  input,
  result,
}: ExcelExportInput): void {
  const wb = buildWorkbook({ input, result });

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });

  // Validate the produced buffer (real xlsx starts with PK\x03\x04)
  const buf = new Uint8Array(buffer as ArrayBuffer);
  if (
    buf.length < 4 ||
    buf[0] !== 0x50 ||
    buf[1] !== 0x4b ||
    buf[2] !== 0x03 ||
    buf[3] !== 0x04
  ) {
    throw new Error("Üretilen xlsx dosyası geçersiz.");
  }

  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kredi-odeme-plani-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Convert a JS Date to Excel's serial date (days since 1900-01-00). */
function excelSerialFromDate(date: Date): number {
  const epoch = Date.UTC(1899, 11, 30);
  return (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
}