"use client";

import { useCallback, useMemo, useState } from "react";
import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import { getMockAvailability } from "@/lib/booking/mock-availability";
import { emptyClientDetails, validateClientDetails } from "@/lib/booking/client-details";
import { getServiceDurationMinutes } from "@/lib/booking/services-catalog";
import type { BookingStep, ServiceId } from "@/lib/booking/types";
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

export function BookingFlow() {
  const [step, setStep] = useState<BookingStep>("session");
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState(emptyClientDetails);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof typeof clientDetails, string>>
  >({});

  const availability = useMemo(() => {
    if (!serviceId) return [];
    return getMockAvailability(28, getServiceDurationMinutes(serviceId), serviceId);
  }, [serviceId]);

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
            timezone={clientDetails.timezone || undefined}
          />
        ) : null}

        {step === "details" ? (
          <ClientInfoForm
            value={clientDetails}
            onChange={setClientDetails}
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
              disabled={!canContinue}
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
