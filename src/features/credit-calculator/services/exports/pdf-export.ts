/**
 * Corporate PDF export for the credit payment plan.
 *
 * A4 portrait, 595 × 842 points. Side margins are 32pt. Table column widths
 * must leave room for pdfmake cell padding (outside `_calcWidth`); prefer
 * `*` columns so the ödeme planı aligns with the compact summary bars.
 *
 * Uses pdfmake with the embedded Roboto font which covers all Turkish
 * Latin characters. Loaded on-demand (client-only) to keep the SSR bundle
 * small.
 */
import type {
  CreditCalculationInput,
  CreditCalculationResult,
} from "../../types";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { getCreditTypeDefaults } from "../credit-types";

interface PdfExportInput {
  input: CreditCalculationInput;
  result: CreditCalculationResult;
}

// --- Minimal structural types for pdfmake -----------------------------------

interface PdfMakeTextNode {
  text: string;
  style?: string;
  bold?: boolean;
  italics?: boolean;
  color?: string;
  fontSize?: number;
  alignment?: "left" | "right" | "center" | "justify";
  margin?: [number, number, number, number] | number;
  colSpan?: number;
  rowSpan?: number;
  fillColor?: string;
  decoration?: "underline" | "lineThrough";
}

interface PdfMakeTableNode {
  table: {
    widths?: Array<string | number>;
    body: Array<Array<PdfMakeTextNode | Record<string, unknown>>>;
    headerRows?: number;
    dontBreakRows?: boolean;
    keepWithHeaderRows?: number;
  };
  layout?: string | Record<string, unknown>;
  margin?: [number, number, number, number];
}

interface PdfMakeStackNode {
  stack: PdfMakeNode[];
  margin?: [number, number, number, number];
  alignment?: "left" | "right" | "center";
}

interface PdfMakeCanvasNode {
  canvas: Array<{
    type: "line";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth?: number;
    lineColor?: string;
  }>;
  margin?: [number, number, number, number];
}

interface PdfMakeTextBlock {
  text: string;
  style?: string;
  margin?: [number, number, number, number];
}

type PdfMakeNode =
  | PdfMakeTextNode
  | PdfMakeTextBlock
  | PdfMakeTableNode
  | { columns: Array<Record<string, unknown>>; columnGap?: number; margin?: [number, number, number, number] }
  | PdfMakeStackNode
  | PdfMakeCanvasNode
  | Record<string, unknown>;

interface PdfMakeDoc {
  content: PdfMakeNode[];
  pageSize?: string;
  pageOrientation?: "portrait" | "landscape";
  pageMargins?: [number, number, number, number];
  defaultStyle?: Record<string, unknown>;
  styles?: Record<string, Record<string, unknown>>;
  info?: Record<string, string>;
  footer?: (currentPage: number, pageCount: number) => PdfMakeNode;
}

interface PdfMakeStatic {
  vfs: Record<string, string>;
  createPdf(doc: PdfMakeDoc): {
    getBuffer(): Promise<Uint8Array>;
    download(name?: string): void;
  };
}

async function loadPdfMake(): Promise<PdfMakeStatic> {
  const pdfMakeModule = (await import("pdfmake/build/pdfmake.js")) as unknown as {
    default?: PdfMakeStatic;
  };
  const vfsModule = (await import("pdfmake/build/vfs_fonts.js")) as unknown as {
    default?: { pdfMake?: { vfs: Record<string, string> } };
    pdfMake?: { vfs: Record<string, string> };
    vfs?: Record<string, string>;
  };
  const pdfMake = pdfMakeModule.default ?? (pdfMakeModule as unknown as PdfMakeStatic);
  const vfs =
    vfsModule.default?.pdfMake?.vfs ??
    vfsModule.pdfMake?.vfs ??
    vfsModule.vfs;
  if (vfs) {
    pdfMake.vfs = vfs;
  }
  return pdfMake;
}

// --- Corporate palette ------------------------------------------------------
// A4 is 595 × 842 points; 34pt side margins → 527pt of usable width.
const C = {
  navy: "#0F2547",
  navy2: "#1E3A8A",
  ink: "#0F172A",
  slate: "#475569",
  slateLight: "#94A3B8",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  surfaceMuted: "#F1F5F9",
  accent: "#2563EB",
};

const M = {
  pageW: 595,
  pageH: 842,
  side: 32,
  top: 44,
  bot: 48,
};

function tx(
  text: string,
  style?: string,
  extra: Partial<PdfMakeTextNode> = {}
): PdfMakeTextNode {
  return { text, style, ...extra };
}

// (buildFourColTable removed — replaced by compact spec/cost bars)

// --- Document content builders ---------------------------------------------

function buildHeaderBlock({
  creditLabel,
  input,
  result,
  generatedAt,
}: {
  creditLabel: string;
  input: CreditCalculationInput;
  result: CreditCalculationResult;
  generatedAt: string;
}): PdfMakeNode {
  return {
    columns: [
      {
        width: "*",
        stack: [
          tx("KREDİ ÖDEME PLANI", "eyebrow"),
          tx(creditLabel.toUpperCase(), "docTitle"),
          {
            margin: [0, 4, 0, 0],
            columns: [
              {
                width: "*",
                stack: [
                  tx("BELGE NO", "metaLabel"),
                  tx(
                    `KP-${Date.now().toString(36).toUpperCase().slice(0, 8)}`,
                    "metaValue"
                  ),
                ],
              },
              {
                width: "*",
                stack: [
                  tx("DÜZENLEME TARİHİ", "metaLabel"),
                  tx(generatedAt, "metaValue"),
                ],
              },
              {
                width: "*",
                stack: [
                  tx("VADE", "metaLabel"),
                  tx(`${input.termMonths} Ay`, "metaValue"),
                ],
              },
            ],
            columnGap: 12,
          },
        ],
      },
      {
        width: 150,
        margin: [10, 0, 0, 0],
        fillColor: C.navy,
        padding: [10, 10, 10, 10],
        stack: [
          tx("AYLIK TAKSİT", "kpiLabelLight"),
          tx(`${formatCurrency(result.monthlyPayment)} ₺`, "kpiValueLight"),
        ],
      },
    ],
    margin: [0, 0, 0, 10],
  };
}

/**
 * Build a single-line "spec bar" containing key inputs (credit type, term,
 * rate type, first payment) plus tax settings — designed to fit in ~22pt of
 * vertical space at the top of the page.
 *
 * Each item is a vertical stack (label above, value below) inside a fixed
 * width cell so long values wrap predictably.
 */
function buildSummaryBar({
  input,
  creditLabel,
}: {
  input: CreditCalculationInput;
  creditLabel: string;
}): PdfMakeNode {
  const rateLabel =
    input.rateType === "monthly"
      ? "Aylık Faiz"
      : input.rateType === "annual_effective"
        ? "Yıllık Efektif"
        : "Yıllık Nominal";

  const items: Array<[string, string]> = [
    ["Kredi Türü", creditLabel],
    ["Kredi Tutarı", `${formatCurrency(input.principal)} ₺`],
    ["Vade", `${input.termMonths} Ay`],
    ["Faiz", `%${formatPercent(input.interestRate)}`],
    ["Faiz Türü", rateLabel],
    ["KKDF", `%${formatPercent(input.kkdfRate)}`],
    ["BSMV", `%${formatPercent(input.bsmvRate)}`],
    ["İlk Taksit", formatDate(input.firstPaymentDate)],
  ];

  // A4 usable = 531pt; 8 columns. First column gets auto width for long
  // credit-type names; remaining 7 split the rest equally.
  return {
    margin: [0, 0, 0, 8],
    table: {
      widths: ["auto", "*", "*", "*", "*", "*", "*", "*"],
      body: [
        items.map<Record<string, unknown>>(([label, value]) => ({
          stack: [
            {
              text: label,
              fontSize: 6.5,
              color: C.slate,
              bold: false,
              margin: [0, 0, 0, 1],
            },
            {
              text: value,
              fontSize: 8,
              color: C.ink,
              bold: true,
            },
          ],
          margin: [0, 2, 4, 2],
        })),
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
    },
  };
}

/**
 * Build a single-line "cost bar" with the key cost indicators in a compact
 * horizontal layout. Vertical size ~22pt.
 */
function buildCostBar({
  result,
  totalTax,
  totalWithFees,
}: {
  result: CreditCalculationResult;
  totalTax: number;
  totalWithFees: number;
}): PdfMakeNode {
  const items: Array<[string, string]> = [
    [
      "Aylık Maliyet",
      `%${formatPercent(result.monthlyCostRate * 100)}`,
    ],
    [
      "Yıllık Maliyet",
      `%${formatPercent(result.annualEffectiveCostRate * 100, 2)}`,
    ],
    ["Toplam Anapara", `${formatCurrency(result.totalPrincipal)} ₺`],
    ["Toplam Faiz", `${formatCurrency(result.totalInterest)} ₺`],
    ["Toplam Vergi", `${formatCurrency(totalTax)} ₺`],
    [
      "Toplam Geri Ödeme",
      `${formatCurrency(result.totalRepayment)} ₺`,
    ],
    [
      "Toplam Maliyet",
      `${formatCurrency(totalWithFees)} ₺`,
    ],
  ];

  return {
    margin: [0, 0, 0, 10],
    table: {
      widths: items.map(() => "*"),
      body: [
        items.map<Record<string, unknown>>(([label, value]) => ({
          stack: [
            {
              text: label,
              fontSize: 6.5,
              color: C.slate,
              bold: false,
              margin: [0, 0, 0, 1],
            },
            {
              text: value,
              fontSize: 8,
              color: C.navy,
              bold: true,
            },
          ],
          margin: [0, 2, 4, 2],
        })),
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
    },
  };
}

function buildPaymentSection({
  result,
}: {
  result: CreditCalculationResult;
}): PdfMakeNode {
  const body: Array<Array<PdfMakeTextNode | Record<string, unknown>>> = [
    [
      { text: "No", style: "th", alignment: "left" },
      { text: "Ödeme Tarihi", style: "th", alignment: "left" },
      { text: "Taksit", style: "thR" },
      { text: "Anapara", style: "thR" },
      { text: "Faiz", style: "thR" },
      { text: "KKDF", style: "thR" },
      { text: "BSMV", style: "thR" },
      { text: "Kalan Anapara", style: "thR" },
    ],
    ...result.schedule.map((row) => [
      { text: String(row.installmentNo), style: "td", alignment: "left" },
      { text: formatDate(row.paymentDate), style: "td", alignment: "left" },
      { text: formatCurrency(row.payment), style: "tdR" },
      { text: formatCurrency(row.principal), style: "tdR" },
      { text: formatCurrency(row.interest), style: "tdR" },
      { text: formatCurrency(row.kkdf), style: "tdR" },
      { text: formatCurrency(row.bsmv), style: "tdR" },
      { text: formatCurrency(row.remainingPrincipal), style: "tdR" },
    ]),
    [
      { text: "TOPLAM", style: "tfL", colSpan: 2, alignment: "left" },
      {},
      { text: formatCurrency(result.totalRepayment), style: "tfR" },
      { text: formatCurrency(result.totalPrincipal), style: "tfR" },
      { text: formatCurrency(result.totalInterest), style: "tfR" },
      { text: formatCurrency(result.totalKkdf), style: "tfR" },
      { text: formatCurrency(result.totalBsmv), style: "tfR" },
      { text: "0,00", style: "tfR" },
    ],
  ];

  return {
    margin: [0, 0, 0, 10],
    stack: [
      {
        columns: [
          {
            width: "*",
            stack: [tx("03", "eyebrow"), tx("ÖDEME PLANI", "sectionTitle")],
          },
        ],
        margin: [0, 0, 0, 4],
      },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          keepWithHeaderRows: 1,
          // pdfmake subtracts cell padding from available width BEFORE assigning
          // column widths (padding is OUTSIDE `_calcWidth`). Fixed widths that
          // sum to the full content area (~531pt) therefore overflow the right
          // margin by ~padding×cols. Use `*` so columns share the remaining
          // space and the table aligns with sections 01/02.
          widths: [18, 54, "*", "*", "*", "*", "*", "*"],
          body,
        },
        layout: {
          hLineWidth: (i: number, node: { table?: { body?: unknown[] } }) => {
            const len = (node.table?.body?.length ?? 0) - 1;
            if (i === 0) return 1;
            if (i === 1) return 0.6;
            if (i === len - 1) return 0.6;
            if (i === len) return 1;
            return 0.3;
          },
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 ? C.navy : C.border),
          paddingTop: () => 2,
          paddingBottom: () => 2,
          paddingLeft: () => 3,
          paddingRight: () => 3,
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return C.navy;
            return undefined;
          },
        },
      },
    ],
  };
}

function buildDocDefinition({
  input,
  result,
}: PdfExportInput): PdfMakeDoc {
  const creditLabel = getCreditTypeDefaults(input.creditType).label;
  const generatedAt = formatDate(new Date());
  const totalTax = result.totalKkdf + result.totalBsmv;
  const totalWithFees = result.totalRepayment + result.totalFees;

  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [M.side, M.top, M.side, M.bot],
    defaultStyle: { fontSize: 9, color: C.ink, lineHeight: 1.2 },
    styles: {
      // Header
      eyebrow: {
        fontSize: 7,
        bold: true,
        color: C.accent,
        margin: [0, 0, 0, 1],
      },
      docTitle: { fontSize: 18, bold: true, color: C.navy },
      metaLabel: {
        fontSize: 6.5,
        color: C.slate,
        margin: [0, 0, 0, 1],
      },
      metaValue: {
        fontSize: 8.5,
        bold: true,
        color: C.ink,
      },
      kpiLabelLight: {
        fontSize: 6.5,
        bold: true,
        color: "#FFFFFF",
        margin: [0, 0, 0, 1],
      },
      kpiValueLight: {
        fontSize: 14,
        bold: true,
        color: "#FFFFFF",
      },
      // Section
      sectionTitle: {
        fontSize: 9,
        bold: true,
        color: C.navy,
        margin: [0, 0, 0, 0],
      },
      // Payment table
      th: {
        fontSize: 7,
        bold: true,
        color: "#FFFFFF",
      },
      thR: {
        fontSize: 7,
        bold: true,
        color: "#FFFFFF",
        alignment: "right",
      },
      td: {
        fontSize: 7.5,
        color: C.ink,
      },
      tdR: {
        fontSize: 7.5,
        color: C.ink,
        alignment: "right",
      },
      tfL: {
        fontSize: 7.5,
        bold: true,
        color: C.navy,
        fillColor: C.surfaceMuted,
      },
      tfR: {
        fontSize: 7.5,
        bold: true,
        color: C.navy,
        alignment: "right",
        fillColor: C.surfaceMuted,
      },
      // Disclaimer
      disclaimer: {
        fontSize: 7,
        color: C.slateLight,
      },
    },
    info: {
      title: "Kredi Ödeme Planı",
      author: "Kredi Hesaplama",
      subject: "Kredi Ödeme Planı",
      keywords: "kredi, ödeme planı, taksit, faiz",
    },
    footer: (currentPage: number, pageCount: number): PdfMakeNode => ({
      columns: [
        {
          text: `${creditLabel} · ${input.termMonths} ay · %${formatPercent(
            input.interestRate
          )} faiz`,
          alignment: "left",
          color: C.slateLight,
          fontSize: 7,
          margin: [M.side, 10, 0, 0],
        },
        {
          text: `Sayfa ${currentPage} / ${pageCount}`,
          alignment: "right",
          color: C.slateLight,
          fontSize: 7,
          margin: [0, 10, M.side, 0],
        },
      ],
    }),
    content: [
      buildHeaderBlock({ creditLabel, input, result, generatedAt }),
      // Decorative navy underline
      {
        margin: [0, 0, 0, 8],
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: M.pageW - M.side * 2,
            y2: 0,
            lineWidth: 0.8,
            lineColor: C.navy,
          },
        ],
      },
      // Compact spec bar — credit summary in one row.
      {
        margin: [0, 0, 0, 6],
        columns: [
          {
            width: 60,
            stack: [tx("01", "eyebrow"), tx("KREDİ ÖZETİ", "sectionTitle")],
          },
          { width: "*", stack: [buildSummaryBar({ input, creditLabel })] },
        ],
      },
      // Compact cost bar — cost indicators in one row.
      {
        margin: [0, 0, 0, 10],
        columns: [
          {
            width: 60,
            stack: [
              tx("02", "eyebrow"),
              tx("MALİYET", "sectionTitle"),
            ],
          },
          { width: "*", stack: [buildCostBar({ result, totalTax, totalWithFees })] },
        ],
      },
      buildPaymentSection({ result }),
      // Disclaimer
      {
        margin: [0, 10, 0, 0],
        text:
          "Bu belge bilgilendirme amaçlıdır. Bankaların faiz, vergi ve masraf uygulamaları farklılık gösterebilir; kesin ödeme planı için ilgili finans kuruluşunun resmi teklifi esas alınmalıdır.",
        style: "disclaimer",
      },
    ],
  };
}

export async function exportCreditPlanPdf({
  input,
  result,
}: PdfExportInput): Promise<void> {
  const pdfMake = await loadPdfMake();
  const doc = buildDocDefinition({ input, result });
  const buffer = await pdfMake.createPdf(doc).getBuffer();
  const blob = new Blob([buffer as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kredi-odeme-plani-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}