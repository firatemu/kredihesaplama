/**
 * Domain types for the credit calculator.
 * Kept pure so the calculation engine has no React/UI dependency.
 */

export type RateType = "monthly" | "annual_effective" | "annual_nominal";

export type CreditType = "consumer" | "housing" | "vehicle" | "commercial" | "other";

export interface RateTypeOption {
  value: RateType;
  label: string;
  description: string;
}

export interface CreditTypeOption {
  value: CreditType;
  label: string;
  description: string;
  /** Default tax configuration. Users can still change. */
  defaults: {
    kkdfRate: number;
    bsmvRate: number;
  };
}

export interface CreditCalculationInput {
  creditType: CreditType;
  principal: number;
  termMonths: number;
  /** Interest rate as percentage value (e.g. 4.99 = %4.99). */
  interestRate: number;
  rateType: RateType;
  /** KKDF rate as percentage value (e.g. 15 = %15). */
  kkdfRate: number;
  /** BSMV rate as percentage value (e.g. 15 = %15). */
  bsmvRate: number;
  firstPaymentDate: Date;
  allocationFee?: number;
  insuranceFee?: number;
  otherFees?: number;
}

export interface PaymentScheduleItem {
  installmentNo: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  kkdf: number;
  bsmv: number;
  remainingPrincipal: number;
}

export interface CreditCalculationResult {
  input: CreditCalculationInput;
  monthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalKkdf: number;
  totalBsmv: number;
  totalFees: number;
  totalRepayment: number;
  /** Decimal (e.g. 0.06487). */
  monthlyCostRate: number;
  /** Decimal (e.g. 1.1260). */
  annualEffectiveCostRate: number;
  schedule: PaymentScheduleItem[];
}