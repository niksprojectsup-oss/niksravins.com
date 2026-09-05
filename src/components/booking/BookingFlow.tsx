"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PublicContent } from "@/content/i18n/types";
import { localizedPath } from "@/lib/i18n/paths";
import { Button } from "@/components/ui/Button";
import { getAvailabilityAction } from "@/lib/booking/availability-actions";
import { emptyClientDetails, validateClientDetails } from "@/lib/booking/client-details";
import type { AvailabilityDay, BookableService, BookingStep } from "@/lib/booking/types";
import { BookingCalendar } from "./BookingCalendar";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingHero } from "./BookingHero";
import { BookingStartDateForm } from "./BookingStartDateForm";
import { BookingStepIndicator } from "./BookingStepIndicator";
import { ClientInfoForm } from "./ClientInfoForm";
import { PaymentBookingForm } from "./PaymentBookingForm";
import { SessionSelection } from "./SessionSelection";

const STEP_ORDER: BookingStep[] = [
  "session",
  "schedule",
  "start-date",
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

type BookingFlowProps = {
  content: PublicContent;
  offers: BookableService[];
};

export function BookingFlow({ content, offers }: BookingFlowProps) {
  const labels = content.bookingUi;
  const [step, setStep] = useState<BookingStep>("session");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [courseStartDate, setCourseStartDate] = useState<string | null>(null);
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState(emptyClientDetails);
  const [displayTimezone, setDisplayTimezone] = useState("Europe/Riga");
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof typeof clientDetails, string>>
  >({});

  const stepContentRef = useRef<HTMLDivElement>(null);

  const selectedService = useMemo(
    () => offers.find((offer) => offer.id === serviceId) ?? null,
    [offers, serviceId],
  );

  const requiresStartDate = selectedService?.requiresStartDate ?? false;

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
    if (!serviceId || step !== "schedule" || requiresStartDate) return;

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
  }, [serviceId, displayTimezone, step, requiresStartDate]);

  const isInitialStepRender = useRef(true);

  const goToStep = useCallback((nextStep: BookingStep) => {
    setStep(nextStep);
  }, []);

  useLayoutEffect(() => {
    if (step === "confirmed") return;

    if (isInitialStepRender.current) {
      isInitialStepRender.current = false;
      return;
    }

    const container = stepContentRef.current;
    if (!container) return;

    const heading = container.querySelector("h2");
    if (!(heading instanceof HTMLElement)) return;

    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function handleNext() {
    if (step === "session" && serviceId) {
      goToStep(requiresStartDate ? "start-date" : "schedule");
      return;
    }

    if (step === "start-date" && courseStartDate) {
      const start = new Date(`${courseStartDate}T09:00:00.000Z`);
      if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
        setStartDateError("Please select a future start date.");
        return;
      }
      setStartDateError(null);
      setSlotId(`course-start:${courseStartDate}`);
      setScheduledAt(start.toISOString());
      goToStep("details");
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

  function handleServiceSelect(nextServiceId: string) {
    setServiceId(nextServiceId);
    setSlotId(null);
    setScheduledAt(null);
    setCourseStartDate(null);
    setStartDateError(null);
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
    (step === "start-date" && courseStartDate !== null) ||
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
        <BookingConfirmation
          labels={labels}
          homeHref={localizedPath(content.locale, "")}
          internationalNotice={content.internationalNotice}
        />
      </div>
    );
  }

  return (
    <div className="layout-container max-w-wide pb-28 md:pb-section-lg">
      <BookingHero content={content} />
      <BookingStepIndicator currentStep={step} requiresStartDate={requiresStartDate} />

      <div className="layout-stack-lg pt-10 md:pt-14">
        <div ref={stepContentRef} key={step} className="layout-stack-lg">
          {step === "session" ? (
            <SessionSelection
              offers={offers}
              selected={serviceId}
              onSelect={handleServiceSelect}
              labels={labels}
            />
          ) : null}

          {step === "start-date" ? (
            <BookingStartDateForm
              value={courseStartDate}
              onChange={setCourseStartDate}
              labels={labels}
              error={startDateError}
            />
          ) : null}

          {step === "schedule" ? (
            <BookingCalendar
              availability={availability}
              selectedSlotId={slotId}
              onSelectSlot={handleSlotSelect}
              timezone={displayTimezone}
              loading={availabilityLoading}
              error={availabilityError}
              isPackage={selectedService?.kind === "package"}
              labels={labels}
            />
          ) : null}

          {step === "details" ? (
            <ClientInfoForm
              value={clientDetails}
              onChange={handleClientDetailsChange}
              errors={formErrors}
              labels={labels}
            />
          ) : null}

          {step === "payment" ? (
            canSubmitPayment ? (
              <PaymentBookingForm
                serviceId={serviceId}
                slotId={slotId}
                scheduledAt={scheduledAt}
                courseStartDate={courseStartDate}
                client={clientDetails}
                checkoutNote={selectedService?.checkoutNote}
                locale={content.locale}
                labels={labels}
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
        </div>

        {step !== "payment" ? (
          <div className="sticky bottom-0 z-10 -mx-[var(--nr-gutter)] border-t border-border-subtle bg-canvas/95 px-[var(--nr-gutter)] py-4 backdrop-blur-sm md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:border-t md:border-border-subtle md:pt-8">
              {step !== "session" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="w-full sm:w-auto"
                >
                  {labels.actions.back}
                </Button>
              ) : null}

              <Button
                type="button"
                onClick={handleNext}
                disabled={!canContinue || (step === "schedule" && availabilityLoading)}
                className="w-full sm:w-auto"
              >
                {labels.actions.continue}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-border-subtle pt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              {labels.actions.back}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
