import type { BookingUiContent } from "@/content/i18n/types";
import type { BookingStep } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

type BookingStepIndicatorProps = {
  currentStep: BookingStep;
  requiresStartDate?: boolean;
  labels: BookingUiContent;
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
  labels,
}: BookingStepIndicatorProps) {
  if (currentStep === "confirmed") return null;

  const visibleSteps = buildVisibleSteps(requiresStartDate);
  const currentIndex = visibleSteps.indexOf(currentStep);
  const stepLabels: Record<Exclude<BookingStep, "confirmed">, string> = {
    session: labels.steps.session,
    schedule: labels.steps.schedule,
    "start-date": labels.steps.startDate,
    details: labels.steps.details,
    payment: labels.steps.payment,
  };

  return (
    <nav aria-label={labels.steps.progressLabel} className="border-b border-border-subtle pb-6">
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
                {String(index + 1).padStart(2, "0")} {stepLabels[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
