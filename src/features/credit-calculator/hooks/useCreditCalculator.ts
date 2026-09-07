"use client";

import { useCallback, useMemo, useState } from "react";
import { calculateCredit } from "../services/credit-calculator";
import { creditFormSchema, type CreditFormValues } from "../schemas";
import { getCreditTypeDefaults } from "../services/credit-types";
import type { CreditCalculationResult } from "../types";

function nextFirstPayment(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  return d;
}

const DEFAULT_VALUES: CreditFormValues = {
  creditType: "consumer",
  principal: 100_000,
  termMonths: 36,
  interestRate: 4.99,
  rateType: "monthly",
  kkdfRate: 15,
  bsmvRate: 15,
  firstPaymentDate: nextFirstPayment(),
  allocationFee: 0,
  insuranceFee: 0,
  otherFees: 0,
};

function withCreditTypeDefaults(values: CreditFormValues): CreditFormValues {
  const defaults = getCreditTypeDefaults(values.creditType);
  return {
    ...values,
    kkdfRate: defaults.defaults.kkdfRate,
    bsmvRate: defaults.defaults.bsmvRate,
  };
}

export interface CreditCalculatorHook {
  values: CreditFormValues;
  errors: Partial<Record<keyof CreditFormValues, string>>;
  result: CreditCalculationResult | null;
  setValue: <K extends keyof CreditFormValues>(
    key: K,
    value: CreditFormValues[K]
  ) => void;
  calculate: () => void;
  reset: () => void;
  valid: boolean;
}

export function useCreditCalculator(): CreditCalculatorHook {
  // The form always starts from defaults on every page load. No URL state or
  // localStorage is read back into the form — every refresh is a clean slate.
  const [values, setValues] = useState<CreditFormValues>(() =>
    withCreditTypeDefaults(DEFAULT_VALUES)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreditFormValues, string>>
  >({});
  const [result, setResult] = useState<CreditCalculationResult | null>(null);

  const liveResult = useMemo(() => {
    const parsed = creditFormSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateCredit(parsed.data);
  }, [values]);

  const displayedResult = liveResult ?? result;

  const calculate = useCallback(() => {
    const parsed = creditFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof CreditFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreditFormValues;
        next[key] = issue.message;
      }
      setErrors(next);
      setResult(null);
      return;
    }
    setErrors({});
    const r = calculateCredit(parsed.data);
    setResult(r);
  }, [values]);

  const setValue = useCallback(
    <K extends keyof CreditFormValues>(key: K, value: CreditFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "creditType") {
          const defaults = getCreditTypeDefaults(value as string);
          return {
            ...next,
            kkdfRate: defaults.defaults.kkdfRate,
            bsmvRate: defaults.defaults.bsmvRate,
          };
        }
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setValues(withCreditTypeDefaults(DEFAULT_VALUES));
    setErrors({});
    setResult(null);
  }, []);

  const valid = useMemo(() => {
    return creditFormSchema.safeParse(values).success;
  }, [values]);

  return {
    values,
    errors,
    result: displayedResult,
    setValue,
    calculate,
    reset,
    valid,
  };
}