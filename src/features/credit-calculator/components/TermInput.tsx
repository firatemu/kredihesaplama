"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { formatCurrency, parseTrNumber } from "../utils/format";
import { TERM_PRESETS } from "../services/credit-types";
import { cn } from "@/lib/utils";

interface TermInputProps {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  error?: string;
  resetKey?: string | number;
}

export function TermInput({
  id,
  value,
  onValueChange,
  error,
  resetKey,
}: TermInputProps) {
  const initialBuffer = React.useMemo(
    () => (value > 0 ? String(Math.floor(value)) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );
  const [buffer, setBuffer] = React.useState<string>(initialBuffer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setBuffer(raw);
    const parsed = parseTrNumber(raw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onValueChange(Math.floor(parsed));
    } else if (raw === "") {
      onValueChange(0);
    }
  };

  return (
    <Field error={error}>
      <Label htmlFor={id}>Taksit Sayısı / Vade</Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={buffer}
        onChange={handleChange}
        placeholder="36"
        invalid={!!error}
        suffix="Ay"
      />
      <div className="grid grid-cols-4 gap-1.5 pt-1 sm:flex sm:flex-wrap">
        {TERM_PRESETS.map((preset) => {
          const active = preset === value;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onValueChange(preset)}
              aria-pressed={active}
              className={cn(
                "min-h-[44px] sm:min-h-[36px] sm:min-w-[44px] px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs rounded-md border",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                active
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-surface text-foreground-muted border-border hover:border-primary-300 hover:text-foreground"
              )}
            >
              {formatCurrency(preset).split(",")[0]} Ay
            </button>
          );
        })}
      </div>
    </Field>
  );
}