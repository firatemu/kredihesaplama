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
    <main className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span
            className="inline-block h-8 w-1.5 rounded-full bg-primary-600"
            aria-hidden="true"
          />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Kredi Hesaplama
          </h1>
        </div>
        <p className="text-sm sm:text-base text-foreground-muted mt-2 max-w-2xl pl-5">
          Tutarı, faiz oranını ve vadeyi girin; aylık taksitinizi ve ödeme
          planınızı anında görün.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CreditInputPanel
            values={values}
            errors={errors}
            onValueChange={setValue}
            onSubmit={calculate}
            onReset={reset}
          />
        </div>
        <div className="min-w-0">
          <CreditSummary result={result} />
        </div>
      </div>

      <div className="mt-6 min-w-0">
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
              <div className="flex flex-col items-center justify-center text-center text-foreground-muted py-10">
                <Wallet className="h-8 w-8 mb-3" aria-hidden="true" />
                <p>Önce kredi bilgilerinizi girip hesapla butonuna basın.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {result ? (
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PaymentBreakdownChart result={result} />
          <RemainingPrincipalChart schedule={result.schedule} />
        </div>
      ) : null}

      <footer className="mt-10">
        <CreditDisclaimer />
      </footer>
    </main>
  );
}
