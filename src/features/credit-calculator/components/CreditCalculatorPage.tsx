"use client";

import { useEffect } from "react";
import { Calculator, Wallet } from "lucide-react";
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

  // Trigger an initial calculation once hydrated so the user sees a populated
  // result without having to press "Hesapla".
  useEffect(() => {
    calculate();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3">
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Kredi Hesaplama
            </h1>
            <p className="text-sm text-foreground-muted mt-1 max-w-2xl">
              Kredi tutarı, faiz oranı ve vadeyi girerek aylık taksitinizi,
              toplam maliyetinizi ve ayrıntılı ödeme planınızı hesaplayın.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_1fr] gap-6">
        <div className="lg:sticky lg:top-6 lg:self-start space-y-6">
          <CreditInputPanel
            values={values}
            errors={errors}
            onValueChange={setValue}
            onSubmit={calculate}
            onReset={reset}
          />
        </div>

        <div className="space-y-6 min-w-0">
          <CreditSummary result={result} />

          {result ? (
            <>
              {/* Ödeme Planı (KPI'dan hemen sonra) */}
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

              {/* Grafikler: Toplam Maliyet Dağılımı + Vade Boyunca Kalan Anapara */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PaymentBreakdownChart result={result} />
                <RemainingPrincipalChart schedule={result.schedule} />
              </div>
            </>
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
      </div>

      <footer className="mt-10">
        <CreditDisclaimer />
      </footer>
    </main>
  );
}