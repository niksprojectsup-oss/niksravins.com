"use client";

import { useState } from "react";
import type { BookingUiContent } from "@/content/i18n/types";
import { Button } from "@/components/ui/Button";
import type { ClientDetails } from "@/lib/booking/types";
import { BookingPanel } from "./BookingPanel";

type PaymentBookingFormProps = {
  serviceId: string;
  slotId: string;
  scheduledAt: string;
  courseStartDate?: string | null;
  client: ClientDetails;
  checkoutNote?: string;
  locale: string;
  labels: BookingUiContent;
};

export function PaymentBookingForm({
  serviceId,
  slotId,
  scheduledAt,
  courseStartDate,
  client,
  checkoutNote,
  locale,
  labels,
}: PaymentBookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleStripeCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          slotId,
          scheduledAt,
          courseStartDate: courseStartDate ?? "",
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone ?? "",
          country: client.country,
          timezone: client.timezone,
          sessionIntention: client.sessionIntention,
          locale,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout. Please try again.");
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start checkout. Please try again.");
      setPending(false);
    }
  }

  return (
    <BookingPanel
      title={labels.payment.title}
      description={labels.payment.description}
    >
      <div className="layout-stack-md max-w-prose">
        {checkoutNote ? (
          <p className="type-body text-ink-muted">{checkoutNote}</p>
        ) : null}

        {error ? (
          <p className="type-caption text-warm" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleStripeCheckout}
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Redirecting…" : labels.payment.stripeLabel}
        </Button>
      </div>
    </BookingPanel>
  );
}
