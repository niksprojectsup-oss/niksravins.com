"use client";

import type { BookingUiContent } from "@/content/i18n/types";
import { BookingPanel } from "./BookingPanel";
import { Field, Input } from "@/components/ui/Field";

type BookingStartDateFormProps = {
  value: string | null;
  onChange: (value: string) => void;
  labels: BookingUiContent;
  error?: string | null;
};

export function BookingStartDateForm({
  value,
  onChange,
  labels,
  error,
}: BookingStartDateFormProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  return (
    <BookingPanel
      title={labels.calendar.courseStartTitle}
      description={labels.calendar.courseStartDescription}
    >
      <div className="max-w-sm">
        <Field
          label={labels.calendar.courseStartLabel}
          id="courseStartDate"
          error={error ?? undefined}
        >
          <Input
            id="courseStartDate"
            name="courseStartDate"
            type="date"
            min={minDate}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            required
          />
        </Field>
      </div>
    </BookingPanel>
  );
}
