"use client";

import { useActionState, useEffect } from "react";
import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import { submitBookingFormAction, type BookingFormState } from "@/lib/booking/actions";
import type { ClientDetails, ServiceId } from "@/lib/booking/types";
import { BookingPanel } from "./BookingPanel";

type PaymentBookingFormProps = {
  serviceId: ServiceId;
  slotId: string;
  scheduledAt: string;
  client: ClientDetails;
  onSuccess: () => void;
};

export function PaymentBookingForm({
  serviceId,
  slotId,
  scheduledAt,
  client,
  onSuccess,
}: PaymentBookingFormProps) {
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(
    submitBookingFormAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <BookingPanel
      title={bookingContent.payment.title}
      description={bookingContent.payment.description}
    >
      <form action={formAction} className="layout-stack-md max-w-prose">
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="slotId" value={slotId} />
        <input type="hidden" name="scheduledAt" value={scheduledAt} />
        <input type="hidden" name="firstName" value={client.firstName} />
        <input type="hidden" name="lastName" value={client.lastName} />
        <input type="hidden" name="email" value={client.email} />
        <input type="hidden" name="phone" value={client.phone ?? ""} />
        <input type="hidden" name="country" value={client.country} />
        <input type="hidden" name="timezone" value={client.timezone} />
        <input type="hidden" name="sessionIntention" value={client.sessionIntention} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled
            aria-disabled
            className="observed-card min-h-14 cursor-not-allowed p-5 text-left opacity-60"
          >
            <p className="type-caption text-ink-subtle">Stripe</p>
            <p className="type-body mt-1">{bookingContent.payment.stripeLabel}</p>
          </button>

          <button
            type="button"
            disabled
            aria-disabled
            className="observed-card min-h-14 cursor-not-allowed p-5 text-left opacity-60"
          >
            <p className="type-caption text-ink-subtle">PayPal</p>
            <p className="type-body mt-1">{bookingContent.payment.paypalLabel}</p>
          </button>
        </div>

        <p className="type-caption">{bookingContent.payment.placeholderNote}</p>

        {state.error ? (
          <p className="type-caption text-warm" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Confirming…" : bookingContent.actions.confirmBooking}
        </Button>
      </form>
    </BookingPanel>
  );
}
