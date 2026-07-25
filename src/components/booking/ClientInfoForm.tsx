"use client";

import { countries, timezones, bookingContent } from "@/content/booking";
import type { ClientDetails } from "@/lib/booking/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { BookingPanel } from "./BookingPanel";

type ClientInfoFormProps = {
  value: ClientDetails;
  onChange: (value: ClientDetails) => void;
  errors?: Partial<Record<keyof ClientDetails, string>>;
};

export function ClientInfoForm({ value, onChange, errors }: ClientInfoFormProps) {
  function updateField<K extends keyof ClientDetails>(
    field: K,
    fieldValue: ClientDetails[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <BookingPanel
      title={bookingContent.form.title}
      description={bookingContent.form.description}
    >
      <form className="layout-stack-md max-w-prose" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First name" id="firstName" error={errors?.firstName}>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={value.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </Field>

          <Field label="Last name" id="lastName" error={errors?.lastName}>
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

        <Field label="Email" id="email" error={errors?.email}>
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Country" id="country" error={errors?.country}>
            <Select
              id="country"
              name="country"
              value={value.country}
              onChange={(e) => updateField("country", e.target.value)}
              required
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Time zone" id="timezone" error={errors?.timezone}>
            <Select
              id="timezone"
              name="timezone"
              value={value.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              required
            >
              <option value="">Select time zone</option>
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label={bookingContent.form.sessionIntentionLabel}
          id="sessionIntention"
          error={errors?.sessionIntention}
        >
          <Textarea
            id="sessionIntention"
            name="sessionIntention"
            placeholder={bookingContent.form.sessionIntentionPlaceholder}
            value={value.sessionIntention}
            onChange={(e) => updateField("sessionIntention", e.target.value)}
            required
          />
        </Field>
      </form>
    </BookingPanel>
  );
}

export const emptyClientDetails: ClientDetails = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  timezone: "Europe/Riga",
  sessionIntention: "",
};

export function validateClientDetails(
  client: ClientDetails,
): Partial<Record<keyof ClientDetails, string>> {
  const errors: Partial<Record<keyof ClientDetails, string>> = {};

  if (!client.firstName.trim()) errors.firstName = "First name is required.";
  if (!client.lastName.trim()) errors.lastName = "Last name is required.";
  if (!client.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!client.country) errors.country = "Country is required.";
  if (!client.timezone) errors.timezone = "Time zone is required.";
  if (!client.sessionIntention.trim()) {
    errors.sessionIntention = "Please share your session intention.";
  }

  return errors;
}
