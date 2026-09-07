/**
 * Credit type configuration. These are the *defaults* the user can override.
 */
import type { CreditTypeOption, RateTypeOption } from "../types";

export const CREDIT_TYPES: CreditTypeOption[] = [
  {
    value: "consumer",
    label: "İhtiyaç Kredisi",
    description: "Bireysel ihtiyaç kredisi.",
    defaults: { kkdfRate: 15, bsmvRate: 15 },
  },
  {
    value: "housing",
    label: "Konut Kredisi",
    description: "Konut alımı için uzun vadeli kredi.",
    defaults: { kkdfRate: 0, bsmvRate: 0 },
  },
  {
    value: "vehicle",
    label: "Taşıt Kredisi",
    description: "Taşıt alımı için kredi.",
    defaults: { kkdfRate: 15, bsmvRate: 15 },
  },
  {
    value: "commercial",
    label: "Ticari Kredi",
    description: "İşletme ve ticari kullanım için kredi.",
    defaults: { kkdfRate: 0, bsmvRate: 5 },
  },
  {
    value: "other",
    label: "Diğer / Manuel",
    description: "Vergi oranlarını kendiniz belirleyin.",
    defaults: { kkdfRate: 0, bsmvRate: 0 },
  },
];

export const RATE_TYPES: RateTypeOption[] = [
  {
    value: "monthly",
    label: "Aylık Faiz",
    description: "Faiz oranı doğrudan aylık olarak uygulanır.",
  },
  {
    value: "annual_effective",
    label: "Yıllık Efektif",
    description: "Yıllık bileşik faiz oranı; aylık orana dönüştürülür.",
  },
  {
    value: "annual_nominal",
    label: "Yıllık Nominal",
    description: "Nominal yıllık oran; 12'ye bölünerek aylık hesaplanır.",
  },
];

export function getCreditTypeDefaults(value: string): CreditTypeOption {
  return (
    CREDIT_TYPES.find((t) => t.value === value) ??
    CREDIT_TYPES[CREDIT_TYPES.length - 1]
  );
}

export const TERM_PRESETS = [3, 6, 12, 18, 24, 36, 48, 60] as const;