declare module "pdfmake/build/pdfmake.js" {
  import type { TCreatedPdf } from "pdfmake/interfaces";

  interface PdfMakeStatic {
    vfs: Record<string, string>;
    createPdf(docDefinition: unknown): TCreatedPdf;
    fonts?: unknown;
  }

  const pdfMake: PdfMakeStatic;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts.js" {
  const vfs: { pdfMake?: { vfs: Record<string, string> }; vfs?: Record<string, string> } | Record<string, string>;
  export default vfs;
}

declare module "pdfmake/interfaces" {
  export interface TDocumentDefinitions {
    pageSize?: string;
    pageOrientation?: "portrait" | "landscape";
    pageMargins?: [number, number, number, number];
    defaultStyle?: Record<string, unknown>;
    styles?: Record<string, Record<string, unknown>>;
    info?: Record<string, string>;
    footer?: (currentPage: number, pageCount: number) => unknown;
    content?: unknown;
    [key: string]: unknown;
  }

  export interface TCreatedPdf {
    getBuffer(): Promise<Uint8Array>;
    download(name?: string): void;
  }
}