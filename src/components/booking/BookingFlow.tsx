"use client";

import { useCallback, useEffect, useState } from "react";
import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import { getAvailabilityAction } from "@/lib/booking/actions";
import { getServiceById } from "@/lib/booking/services-catalog";
import { emptyClientDetails, validateClientDetails } from "@/lib/booking/client-details";
import type { AvailabilityDay, BookingStep, ServiceId } from "@/lib/booking/types";
import { BookingCalendar } from "./BookingCalendar";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingHero } from "./BookingHero";
import { BookingStepIndicator } from "./BookingStepIndicator";
import { ClientInfoForm } from "./ClientInfoForm";
import { PaymentBookingForm } from "./PaymentBookingForm";
import { SessionSelection } from "./SessionSelection";

const STEP_ORDER: BookingStep[] = [
  "session",
  "schedule",
  "details",
  "payment",
  "confirmed",
];

function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Riga";
  } catch {
    return "Europe/Riga";
  }
}

export function BookingFlow() {
  const [step, setStep] = useState<BookingStep>("session");
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState(emptyClientDetails);
  const [displayTimezone, setDisplayTimezone] = useState("Europe/Riga");
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof typeof clientDetails, string>>
  >({});

  const selectedService = serviceId ? getServiceById(serviceId) : null;

  useEffect(() => {
    const detected = detectBrowserTimezone();
    setDisplayTimezone(detected);
    setClientDetails((current) =>
      current.timezone === "Europe/Riga"
        ? { ...current, timezone: detected }
        : current,
    );
  }, []);

  useEffect(() => {
    if (!serviceId || step !== "schedule") return;

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    getAvailabilityAction(serviceId, displayTimezone)
      .then((days) => {
        if (!cancelled) setAvailability(days);
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability([]);
          setAvailabilityError("Unable to load available times. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, displayTimezone, step]);

  const goToStep = useCallback((nextStep: BookingStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBookingSuccess = useCallback(() => {
    goToStep("confirmed");
  }, [goToStep]);

  function handleNext() {
    if (step === "session" && serviceId) {
      goToStep("schedule");
      return;
    }

    if (step === "schedule" && slotId && scheduledAt) {
      goToStep("details");
      return;
    }

    if (step === "details") {
      const errors = validateClientDetails(clientDetails);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;
      goToStep("payment");
    }
  }

  function handleBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) goToStep(STEP_ORDER[index - 1]);
  }

  function handleServiceSelect(nextServiceId: ServiceId) {
    setServiceId(nextServiceId);
    setSlotId(null);
    setScheduledAt(null);
  }

  function handleSlotSelect(nextSlotId: string, nextScheduledAt: string) {
    setSlotId(nextSlotId);
    setScheduledAt(nextScheduledAt);
  }

  function handleClientDetailsChange(next: typeof clientDetails) {
    setClientDetails(next);
    if (next.timezone) {
      setDisplayTimezone(next.timezone);
    }
  }

  const canContinue =
    (step === "session" && serviceId !== null) ||
    (step === "schedule" && slotId !== null && scheduledAt !== null) ||
    step === "details";

  const canSubmitPayment =
    serviceId !== null &&
    slotId !== null &&
    scheduledAt !== null &&
    Object.keys(validateClientDetails(clientDetails)).length === 0;

  if (step === "confirmed") {
    return (
      <div className="layout-container max-w-wide pb-section-lg">
        <BookingConfirmation />
      </div>
    );
  }

  return (
    <div className="layout-container max-w-wide pb-section-lg">
      <BookingHero />
      <BookingStepIndicator currentStep={step} />

      <div className="layout-stack-lg pt-10 md:pt-14">
        {step === "session" ? (
          <SessionSelection selected={serviceId} onSelect={handleServiceSelect} />
        ) : null}

        {step === "schedule" ? (
          <BookingCalendar
            availability={availability}
            selectedSlotId={slotId}
            onSelectSlot={handleSlotSelect}
            timezone={displayTimezone}
            loading={availabilityLoading}
            error={availabilityError}
          />
        ) : null}

        {step === "details" ? (
          <ClientInfoForm
            value={clientDetails}
            onChange={handleClientDetailsChange}
            errors={formErrors}
          />
        ) : null}

        {step === "payment" ? (
          canSubmitPayment ? (
            <PaymentBookingForm
              serviceId={serviceId}
              slotId={slotId}
              scheduledAt={scheduledAt}
              client={clientDetails}
              checkoutNote={selectedService?.checkoutNote}
              onSuccess={handleBookingSuccess}
            />
          ) : (
            <div className="observed-card p-6 md:p-8">
              <p className="type-body text-warm" role="alert">
                Your booking details are incomplete. Go back and fill in all required
                fields before confirming.
              </p>
            </div>
          )
        ) : null}

        {step !== "payment" ? (
          <div className="flex flex-col gap-4 border-t border-border-subtle pt-8 sm:flex-row sm:items-center">
            {step !== "session" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                {bookingContent.actions.back}
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue || (step === "schedule" && availabilityLoading)}
              className="w-full sm:w-auto"
            >
              {bookingContent.actions.continue}
            </Button>
          </div>
        ) : (
          <div className="border-t border-border-subtle pt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              {bookingContent.actions.back}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
