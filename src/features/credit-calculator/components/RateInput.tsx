"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { RATE_TYPES } from "../services/credit-types";
import { formatPercent, parseTrNumber } from "../utils/format";
import type { RateType } from "../types";

interface RateInputProps {
  id: string;
  value: number;
  rateType: RateType;
  onValueChange: (value: number) => void;
  onRateTypeChange: (value: RateType) => void;
  error?: string;
  required?: boolean;
  resetKey?: string | number;
}

export function RateInput({
  id,
  value,
  rateType,
  onValueChange,
  onRateTypeChange,
  error,
  required,
  resetKey,
}: RateInputProps) {
  const initialBuffer = React.useMemo(
    () => (Number.isFinite(value) && value > 0 ? formatPercent(value) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );
  const [buffer, setBuffer] = React.useState<string>(initialBuffer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setBuffer(raw);
    const parsed = parseTrNumber(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onValueChange(parsed);
    } else if (raw === "") {
      onValueChange(0);
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
      <Label htmlFor={id} required={required}>
        Faiz Oranı
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
        invalid={!!error}
        suffix="%"
      />
      <div className="pt-1">
        <Segmented
          ariaLabel="Faiz oranı türü"
          value={rateType}
          onChange={onRateTypeChange}
          options={RATE_TYPES.map((r) => ({ value: r.value, label: r.label }))}
          fullWidth
        />
        <p className="text-xs text-foreground-subtle mt-1.5">
          {RATE_TYPES.find((r) => r.value === rateType)?.description}
        </p>
      </div>
    </Field>
  );
}