import type { BookingStep } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<Exclude<BookingStep, "confirmed">, string> = {
  session: "Session",
  schedule: "Time",
  details: "Details",
  payment: "Payment",
};

type BookingStepIndicatorProps = {
  currentStep: BookingStep;
  followUpMode?: boolean;
};

const VISIBLE_STEPS: Exclude<BookingStep, "confirmed">[] = [
  "session",
  "schedule",
  "details",
  "payment",
];

export function BookingStepIndicator({
  currentStep,
  followUpMode = false,
}: BookingStepIndicatorProps) {
  if (currentStep === "confirmed") return null;

  const currentIndex = VISIBLE_STEPS.indexOf(currentStep);
  const paymentLabel = followUpMode ? "Confirm" : STEP_LABELS.payment;

  return (
    <nav aria-label="Booking progress" className="border-b border-border-subtle pb-6">
      <ol className="flex flex-wrap gap-x-6 gap-y-2">
        {VISIBLE_STEPS.map((step, index) => {
          const isActive = step === currentStep;
          const isComplete = index < currentIndex;
          const label = step === "payment" ? paymentLabel : STEP_LABELS[step];

          return (
            <li key={step}>
              <span
                className={cn(
                  "type-caption",
                  isActive && "text-ink",
                  isComplete && "text-accent",
                  !isActive && !isComplete && "text-ink-faint",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {String(index + 1).padStart(2, "0")} {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
