"use client";

import { useEffect } from "react";
import { Wallet } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditInputPanel } from "./CreditInputPanel";
import { CreditSummary } from "./CreditSummary";
import { PaymentSchedule } from "./PaymentScheduleTable";
import { PaymentBreakdownChart } from "./PaymentBreakdownChart";
import { RemainingPrincipalChart } from "./RemainingPrincipalChart";
import { ExportActions } from "./ExportActions";
import { CreditDisclaimer } from "./CreditDisclaimer";
import { useCreditCalculator } from "../hooks/useCreditCalculator";

export function CreditCalculatorPage() {
  const { values, errors, result, setValue, calculate, reset } =
    useCreditCalculator();

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span
            className="inline-block h-7 w-1.5 rounded-full bg-primary-600"
            aria-hidden="true"
          />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Kredi Hesaplama
          </h1>
        </div>
        <p className="text-sm text-foreground-muted mt-1.5 max-w-2xl pl-5">
          Tutarı, faiz oranını ve vadeyi girin; aylık taksitinizi ve ödeme
          planınızı anında görün.
        </p>
      </header>

      {/* Form + results column: no dead empty space beside the form */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-5 items-start">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CreditInputPanel
            values={values}
            errors={errors}
            onValueChange={setValue}
            onSubmit={calculate}
            onReset={reset}
          />
        </div>

        <div className="min-w-0 flex flex-col gap-4">
          <CreditSummary result={result} />

          {result ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaymentBreakdownChart result={result} />
              <RemainingPrincipalChart schedule={result.schedule} />
            </div>
          ) : null}

          {result ? (
            <PaymentSchedule
              schedule={result.schedule}
              totalRow={{
                payment: result.totalRepayment,
                principal: result.totalPrincipal,
                interest: result.totalInterest,
                kkdf: result.totalKkdf,
                bsmv: result.totalBsmv,
              }}
              headerAction={
                <ExportActions
                  input={result.input}
                  result={result}
                  compact
                />
              }
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Planı</CardTitle>
                <p className="text-sm text-foreground-muted">
                  Hesaplama yapıldıktan sonra ödeme planı burada görüntülenir.
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-center justify-center text-center text-foreground-muted py-8">
                  <Wallet className="h-7 w-7 mb-2" aria-hidden="true" />
                  <p className="text-sm">
                    Önce kredi bilgilerinizi girip hesapla butonuna basın.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <footer className="mt-8">
        <CreditDisclaimer />
      </footer>
    </main>
  );
}
