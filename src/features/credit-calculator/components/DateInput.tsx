"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { fromDateInputValue, toDateInputValue } from "../utils/format";

interface DateInputProps {
  id: string;
  value: Date;
  onValueChange: (date: Date) => void;
  error?: string;
}

export function DateInput({ id, value, onValueChange, error }: DateInputProps) {
  return (
    <Field error={error}>
      <Label htmlFor={id}>İlk Taksit Tarihi</Label>
      <Input
        id={id}
        type="date"
        value={toDateInputValue(value)}
        onChange={(e) => {
          const next = fromDateInputValue(e.target.value);
          if (next) onValueChange(next);
        }}
        invalid={!!error}
      />
    </Field>
  );
}