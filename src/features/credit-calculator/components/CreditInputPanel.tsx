"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditTypeSelect } from "./CreditTypeSelect";
import { MoneyInput } from "./MoneyInput";
import { TermInput } from "./TermInput";
import { RateInput } from "./RateInput";
import { DateInput } from "./DateInput";
import { AdvancedCostSettings } from "./AdvancedCostSettings";
import type { CreditType, RateType } from "../types";
import type { CreditFormValues as SchemaCreditFormValues } from "../schemas";

export interface CreditInputErrors {
  principal?: string;
  termMonths?: string;
  interestRate?: string;
  kkdfRate?: string;
  bsmvRate?: string;
  firstPaymentDate?: string;
  allocationFee?: string;
  insuranceFee?: string;
  otherFees?: string;
}

interface CreditInputPanelProps {
  values: SchemaCreditFormValues;
  errors?: CreditInputErrors;
  onValueChange: <K extends keyof SchemaCreditFormValues>(
    key: K,
    value: SchemaCreditFormValues[K]
  ) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting?: boolean;
}

export function CreditInputPanel({
  values,
  errors,
  onValueChange,
  onSubmit,
  onReset,
  isSubmitting = false,
}: CreditInputPanelProps) {
  return (
    <Card className="no-print">
      <CardHeader className="space-y-0.5">
        <CardTitle>Kredi Bilgileri</CardTitle>
        <p className="text-sm text-foreground-muted">
          Kredi tutarı, vade ve faiz oranını girin.
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <CreditTypeSelect
          value={values.creditType}
          onChange={(v: CreditType) => onValueChange("creditType", v)}
        />

        <MoneyInput
          id="principal"
          label="Kredi Tutarı"
          value={values.principal}
          onValueChange={(v) => onValueChange("principal", v)}
          required
          error={errors?.principal}
          placeholder="100.000,00"
        />

        <TermInput
          id="term"
          value={values.termMonths}
          onValueChange={(v) => onValueChange("termMonths", v)}
          error={errors?.termMonths}
        />

        <RateInput
          id="interest-rate"
          value={values.interestRate}
          rateType={values.rateType}
          onValueChange={(v) => onValueChange("interestRate", v)}
          onRateTypeChange={(v: RateType) => onValueChange("rateType", v)}
          required
          error={errors?.interestRate}
        />

        <DateInput
          id="first-payment-date"
          value={values.firstPaymentDate}
          onValueChange={(d) => onValueChange("firstPaymentDate", d)}
          error={errors?.firstPaymentDate}
        />

        <Separator />

        <AdvancedCostSettings
          kkdfRate={values.kkdfRate}
          bsmvRate={values.bsmvRate}
          allocationFee={values.allocationFee ?? 0}
          insuranceFee={values.insuranceFee ?? 0}
          otherFees={values.otherFees ?? 0}
          onChange={(next) => {
            onValueChange("kkdfRate", next.kkdfRate);
            onValueChange("bsmvRate", next.bsmvRate);
            onValueChange("allocationFee", next.allocationFee);
            onValueChange("insuranceFee", next.insuranceFee);
            onValueChange("otherFees", next.otherFees);
          }}
          errors={{
            kkdfRate: errors?.kkdfRate,
            bsmvRate: errors?.bsmvRate,
            allocationFee: errors?.allocationFee,
            insuranceFee: errors?.insuranceFee,
            otherFees: errors?.otherFees,
          }}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            fullWidth
            className="sm:w-auto"
          >
            Temizle
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={onSubmit}
            loading={isSubmitting}
            fullWidth
            className="sm:flex-1"
          >
            Hesapla
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}