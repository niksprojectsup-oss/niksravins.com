"use client";

import type { BookingUiContent } from "@/content/i18n/types";
import type { ClientDetails } from "@/lib/booking/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { BookingPanel } from "./BookingPanel";

type ClientInfoFormProps = {
  value: ClientDetails;
  onChange: (value: ClientDetails) => void;
  errors?: Partial<Record<keyof ClientDetails, string>>;
  labels: BookingUiContent;
};

export function ClientInfoForm({ value, onChange, errors, labels }: ClientInfoFormProps) {
  function updateField<K extends keyof ClientDetails>(
    field: K,
    fieldValue: ClientDetails[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <BookingPanel
      title={labels.form.title}
      description={labels.form.description}
    >
      <form className="layout-stack-md max-w-prose" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={labels.form.firstName} id="firstName" error={errors?.firstName}>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={value.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </Field>

          <Field label={labels.form.lastName} id="lastName" error={errors?.lastName}>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={value.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label={labels.form.email} id="email" error={errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={value.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </Field>

        <Field label={labels.form.phoneOptional} id="phone" error={errors?.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={value.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={labels.form.country} id="country" error={errors?.country}>
            <Select
              id="country"
              name="country"
              value={value.country}
              onChange={(e) => updateField("country", e.target.value)}
              required
            >
              <option value="">{labels.form.selectCountry}</option>
              {labels.form.countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={labels.form.timezone} id="timezone" error={errors?.timezone}>
            <Select
              id="timezone"
              name="timezone"
              value={value.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              required
            >
              <option value="">{labels.form.selectTimezone}</option>
              {labels.form.timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label={labels.form.sessionIntentionLabel}
          id="sessionIntention"
          error={errors?.sessionIntention}
        >
          <Textarea
            id="sessionIntention"
            name="sessionIntention"
            placeholder={labels.form.sessionIntentionPlaceholder}
            value={value.sessionIntention}
            onChange={(e) => updateField("sessionIntention", e.target.value)}
            required
          />
        </Field>
      </form>
    </BookingPanel>
  );
}
