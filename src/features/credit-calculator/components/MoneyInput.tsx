"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { formatCurrency, parseTrNumber } from "../utils/format";

interface MoneyInputProps {
  id: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  tooltip?: React.ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Money input that buffers a free-form Turkish numeric string while still
 * communicating a parsed numeric value back to the parent.
 *
 * The component is "reset-aware": pass a `resetKey` that changes when the
 * parent wants the visible buffer to be cleared.
 */
export function MoneyInput({
  id,
  label,
  value,
  onValueChange,
  error,
  hint,
  required,
  tooltip,
  placeholder = "0,00",
  min,
  max,
  step,
  resetKey,
}: MoneyInputProps & { resetKey?: string | number }) {
  const initialBuffer = React.useMemo(
    () => (Number.isFinite(value) && value !== 0 ? formatCurrency(value) : ""),
    // Intentionally only on mount / resetKey change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );
  const [buffer, setBuffer] = React.useState<string>(initialBuffer);

  // If the external value changes (e.g. parent reset) but the user is mid-typing
  // an equivalent value, we don't clobber their input. We only re-seed the buffer
  // when the *resetKey* changes (handled by the useState initializer above).

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
      setBuffer(parsed === 0 ? "" : formatCurrency(parsed));
    } else {
      setBuffer("");
    }
  };

  return (
    <Field error={error} hint={hint}>
      <Label htmlFor={id} required={required} tooltip={tooltip}>
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
        placeholder={placeholder}
        invalid={!!error}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        min={min}
        max={max}
        step={step}
      />
      <span id={`${id}-help`} className="sr-only">
        {error ?? hint ?? ""}
      </span>
    </Field>
  );
}