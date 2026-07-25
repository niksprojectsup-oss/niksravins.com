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
};

const VISIBLE_STEPS: Exclude<BookingStep, "confirmed">[] = [
  "session",
  "schedule",
  "details",
  "payment",
];

export function BookingStepIndicator({
  currentStep,
}: BookingStepIndicatorProps) {
  if (currentStep === "confirmed") return null;

  const currentIndex = VISIBLE_STEPS.indexOf(currentStep);

  return (
    <nav aria-label="Booking progress" className="border-b border-border-subtle pb-6">
      <ol className="flex flex-wrap gap-x-6 gap-y-2">
        {VISIBLE_STEPS.map((step, index) => {
          const isActive = step === currentStep;
          const isComplete = index < currentIndex;

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
                {String(index + 1).padStart(2, "0")} {STEP_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
