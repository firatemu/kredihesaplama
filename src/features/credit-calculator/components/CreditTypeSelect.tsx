"use client";

import { CreditCard } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { CREDIT_TYPES } from "../services/credit-types";
import type { CreditType } from "../types";

interface CreditTypeSelectProps {
  value: CreditType;
  onChange: (value: CreditType) => void;
  error?: string;
}

export function CreditTypeSelect({
  value,
  onChange,
  error,
}: CreditTypeSelectProps) {
  return (
    <Field error={error}>
      <Label htmlFor="credit-type">
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
          Kredi Türü
        </span>
      </Label>
      <Select
        id="credit-type"
        value={value}
        onChange={(e) => onChange(e.target.value as CreditType)}
        invalid={!!error}
      >
        {CREDIT_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}