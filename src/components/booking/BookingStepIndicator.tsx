import type { BookingStep } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<Exclude<BookingStep, "confirmed">, string> = {
  session: "Session",
  schedule: "Time",
  "start-date": "Start date",
  details: "Details",
  payment: "Payment",
};

type BookingStepIndicatorProps = {
  currentStep: BookingStep;
  requiresStartDate?: boolean;
};

function buildVisibleSteps(requiresStartDate: boolean): Exclude<BookingStep, "confirmed">[] {
  if (requiresStartDate) {
    return ["session", "start-date", "details", "payment"];
  }
  return ["session", "schedule", "details", "payment"];
}

export function BookingStepIndicator({
  currentStep,
  requiresStartDate = false,
}: BookingStepIndicatorProps) {
  if (currentStep === "confirmed") return null;

  const visibleSteps = buildVisibleSteps(requiresStartDate);
  const currentIndex = visibleSteps.indexOf(currentStep);

  return (
    <nav aria-label="Booking progress" className="border-b border-border-subtle pb-6">
      <ol className="flex flex-wrap gap-x-6 gap-y-2">
        {visibleSteps.map((step, index) => {
          const isActive = step === currentStep;
          const isComplete = currentIndex >= 0 && index < currentIndex;

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
