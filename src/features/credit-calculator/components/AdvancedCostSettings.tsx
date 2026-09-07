"use client";

import * as React from "react";
import { Collapsible } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  formatPercent,
  parseTrNumber,
} from "../utils/format";

interface AdvancedCostSettingsProps {
  kkdfRate: number;
  bsmvRate: number;
  allocationFee: number;
  insuranceFee: number;
  otherFees: number;
  onChange: (next: {
    kkdfRate: number;
    bsmvRate: number;
    allocationFee: number;
    insuranceFee: number;
    otherFees: number;
  }) => void;
  errors?: Partial<{
    kkdfRate: string;
    bsmvRate: string;
    allocationFee: string;
    insuranceFee: string;
    otherFees: string;
  }>;
  resetKey?: string | number;
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  error?: string;
  suffix?: string;
  placeholder?: string;
  tooltip?: React.ReactNode;
  resetKey?: string | number;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  suffix,
  placeholder,
  tooltip,
  resetKey,
}: NumberFieldProps) {
  const initialBuffer = React.useMemo(
    () => (value > 0 ? formatCurrency(value) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );
  const [buffer, setBuffer] = React.useState<string>(initialBuffer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setBuffer(raw);
    const parsed = parseTrNumber(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else if (raw === "") {
      onChange(0);
    }
  };

  const handleBlur = () => {
    const parsed = parseTrNumber(buffer);
    if (Number.isFinite(parsed)) {
      setBuffer(parsed === 0 ? "" : formatCurrency(parsed));
    } else {
      setBuffer("");
    }
  };

  return (
    <Field error={error}>
      <Label htmlFor={id} tooltip={tooltip}>
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={buffer}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder ?? "0,00"}
        suffix={suffix}
        invalid={!!error}
      />
    </Field>
  );
}

interface PercentFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  error?: string;
  tooltip?: React.ReactNode;
  resetKey?: string | number;
}

function PercentField({
  id,
  label,
  value,
  onChange,
  error,
  tooltip,
  resetKey,
}: PercentFieldProps) {
  const initialBuffer = React.useMemo(
    () => (value > 0 ? formatPercent(value) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );
  const [buffer, setBuffer] = React.useState<string>(initialBuffer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setBuffer(raw);
    const parsed = parseTrNumber(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else if (raw === "") {
      onChange(0);
    }
  };

  const handleBlur = () => {
    const parsed = parseTrNumber(buffer);
    if (Number.isFinite(parsed)) {
      setBuffer(parsed === 0 ? "" : formatPercent(parsed));
    } else {
      setBuffer("");
    }
  };

  return (
    <Field error={error}>
      <Label htmlFor={id} tooltip={tooltip}>
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={buffer}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0,00"
        suffix="%"
        invalid={!!error}
      />
    </Field>
  );
}

export function AdvancedCostSettings({
  kkdfRate,
  bsmvRate,
  allocationFee,
  insuranceFee,
  otherFees,
  onChange,
  errors,
  resetKey,
}: AdvancedCostSettingsProps) {
  return (
    <Collapsible
      title="Gelişmiş Vergi ve Maliyet Ayarları"
      description="KKDF, BSMV ve ek masraflar"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
        <PercentField
          id="kkdf-rate"
          label="KKDF"
          value={kkdfRate}
          onChange={(v) =>
            onChange({
              kkdfRate: v,
              bsmvRate,
              allocationFee,
              insuranceFee,
              otherFees,
            })
          }
          error={errors?.kkdfRate}
          tooltip="Kaynak Kullanımını Destekleme Fonu. Faiz üzerinden uygulanır."
          resetKey={resetKey}
        />
        <PercentField
          id="bsmv-rate"
          label="BSMV"
          value={bsmvRate}
          onChange={(v) =>
            onChange({
              kkdfRate,
              bsmvRate: v,
              allocationFee,
              insuranceFee,
              otherFees,
            })
          }
          error={errors?.bsmvRate}
          tooltip="Banka ve Sigorta Muameleleri Vergisi. Faiz üzerinden uygulanır."
          resetKey={resetKey}
        />
        <NumberField
          id="allocation-fee"
          label="Kredi Tahsis Ücreti"
          value={allocationFee}
          onChange={(v) =>
            onChange({
              kkdfRate,
              bsmvRate,
              allocationFee: v,
              insuranceFee,
              otherFees,
            })
          }
          error={errors?.allocationFee}
          placeholder="0,00 ₺"
          resetKey={resetKey}
        />
        <NumberField
          id="insurance-fee"
          label="Sigorta"
          value={insuranceFee}
          onChange={(v) =>
            onChange({
              kkdfRate,
              bsmvRate,
              allocationFee,
              insuranceFee: v,
              otherFees,
            })
          }
          error={errors?.insuranceFee}
          placeholder="0,00 ₺"
          resetKey={resetKey}
        />
        <NumberField
          id="other-fees"
          label="Diğer Masraflar"
          value={otherFees}
          onChange={(v) =>
            onChange({
              kkdfRate,
              bsmvRate,
              allocationFee,
              insuranceFee,
              otherFees: v,
            })
          }
          error={errors?.otherFees}
          placeholder="0,00 ₺"
          resetKey={resetKey}
        />
      </div>
    </Collapsible>
  );
}