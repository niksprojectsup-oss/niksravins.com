"use client";

import { useMemo, useState } from "react";
import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import { getMockAvailability } from "@/lib/booking/mock-availability";
import { createMockBooking } from "@/lib/booking/services";
import type {
  BookingDraft,
  BookingStep,
  ClientDetails,
  SessionType,
} from "@/lib/booking/types";
import { BookingCalendar } from "./BookingCalendar";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingHero } from "./BookingHero";
import { BookingStepIndicator } from "./BookingStepIndicator";
import {
  ClientInfoForm,
  emptyClientDetails,
  validateClientDetails,
} from "./ClientInfoForm";
import { PaymentPlaceholder } from "./PaymentPlaceholder";
import { SessionSelection } from "./SessionSelection";

const STEP_ORDER: BookingStep[] = [
  "session",
  "schedule",
  "details",
  "payment",
  "confirmed",
];

export function BookingFlow() {
  const availability = useMemo(() => getMockAvailability(), []);

  const [step, setStep] = useState<BookingStep>("session");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>({
    sessionType: null,
    slotId: null,
    scheduledAt: null,
    client: null,
  });
  const [clientDetails, setClientDetails] =
    useState<ClientDetails>(emptyClientDetails);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ClientDetails, string>>
  >({});

  function goToStep(nextStep: BookingStep) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (step === "session" && draft.sessionType) {
      goToStep("schedule");
      return;
    }

    if (step === "schedule" && draft.slotId) {
      goToStep("details");
      return;
    }

    if (step === "details") {
      const errors = validateClientDetails(clientDetails);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setDraft((prev) => ({ ...prev, client: clientDetails }));
      goToStep("payment");
    }
  }

  function handleBack() {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) goToStep(STEP_ORDER[index - 1]);
  }

  function handleSessionSelect(type: SessionType) {
    setDraft((prev) => ({ ...prev, sessionType: type }));
  }

  function handleSlotSelect(slotId: string, scheduledAt: string) {
    setDraft((prev) => ({ ...prev, slotId, scheduledAt }));
  }

  async function handleConfirmBooking() {
    if (
      !draft.sessionType ||
      !draft.slotId ||
      !draft.scheduledAt ||
      !draft.client
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createMockBooking({
        sessionType: draft.sessionType,
        slotId: draft.slotId,
        scheduledAt: draft.scheduledAt,
        client: draft.client,
      });
      goToStep("confirmed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canContinue =
    (step === "session" && draft.sessionType !== null) ||
    (step === "schedule" && draft.slotId !== null) ||
    step === "details";

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
          <SessionSelection
            selected={draft.sessionType}
            onSelect={handleSessionSelect}
          />
        ) : null}

        {step === "schedule" ? (
          <BookingCalendar
            availability={availability}
            selectedSlotId={draft.slotId}
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
          <PaymentPlaceholder
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
          />
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
