/**
 * Zod validation schemas for the credit calculator form.
 */
import { z } from "zod";

const MAX_PRINCIPAL = 100_000_000; // 100M TL
const MAX_TERM = 600; // 50 years
const MAX_RATE = 1000; // %1000
const MAX_TAX = 100; // %100

export const creditFormSchema = z.object({
  creditType: z.enum([
    "consumer",
    "housing",
    "vehicle",
    "commercial",
    "other",
  ]),
  principal: z
    .number({
      message: "Kredi tutarı geçerli bir sayı olmalıdır.",
    })
    .positive("Kredi tutarı 0'dan büyük olmalıdır.")
    .max(MAX_PRINCIPAL, "Kredi tutarı çok yüksek.")
    .finite("Kredi tutarı geçerli bir sayı olmalıdır."),
  termMonths: z
    .number({
      message: "Vade geçerli bir sayı olmalıdır.",
    })
    .int("Vade tam sayı olmalıdır.")
    .min(1, "Vade en az 1 ay olmalıdır.")
    .max(MAX_TERM, "Vade çok yüksek.")
    .finite("Vade geçerli bir sayı olmalıdır."),
  interestRate: z
    .number({
      message: "Faiz oranı geçerli bir sayı olmalıdır.",
    })
    .min(0, "Faiz oranı negatif olamaz.")
    .max(MAX_RATE, "Faiz oranı çok yüksek.")
    .finite("Faiz oranı geçerli bir sayı olmalıdır."),
  rateType: z.enum(["monthly", "annual_effective", "annual_nominal"]),
  kkdfRate: z
    .number({
      message: "KKDF oranı geçerli bir sayı olmalıdır.",
    })
    .min(0, "KKDF oranı negatif olamaz.")
    .max(MAX_TAX, "KKDF oranı çok yüksek.")
    .finite("KKDF oranı geçerli bir sayı olmalıdır."),
  bsmvRate: z
    .number({
      message: "BSMV oranı geçerli bir sayı olmalıdır.",
    })
    .min(0, "BSMV oranı negatif olamaz.")
    .max(MAX_TAX, "BSMV oranı çok yüksek.")
    .finite("BSMV oranı geçerli bir sayı olmalıdır."),
  firstPaymentDate: z.date({
    message: "İlk taksit tarihi geçerli bir tarih olmalıdır.",
  }),
  allocationFee: z
    .number()
    .min(0, "Tahsis ücreti negatif olamaz.")
    .max(MAX_PRINCIPAL, "Tahsis ücreti çok yüksek.")
    .optional()
    .default(0),
  insuranceFee: z
    .number()
    .min(0, "Sigorta ücreti negatif olamaz.")
    .max(MAX_PRINCIPAL, "Sigorta ücreti çok yüksek.")
    .optional()
    .default(0),
  otherFees: z
    .number()
    .min(0, "Diğer ücretler negatif olamaz.")
    .max(MAX_PRINCIPAL, "Diğer ücretler çok yüksek.")
    .optional()
    .default(0),
});

export type CreditFormValues = z.infer<typeof creditFormSchema>;