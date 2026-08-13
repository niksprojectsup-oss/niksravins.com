import type { PackageSessionSlot } from "@/lib/admin/client-types";
import { cn } from "@/lib/utils";

type JourneyProgressBarProps = {
  timeline: PackageSessionSlot[];
  totalSessions: number;
  className?: string;
};

export function JourneyProgressBar({
  timeline,
  totalSessions,
  className,
}: JourneyProgressBarProps) {
  const completedCount = timeline.filter((slot) => slot.status === "completed").length;
  const scheduledUpcoming = timeline.find(
    (slot) => slot.status === "scheduled" || slot.status === "completed",
  );
  const nextUnscheduled = timeline.find((slot) => slot.status === "not_scheduled");
  const currentSessionNumber =
    completedCount >= totalSessions
      ? totalSessions
      : scheduledUpcoming && scheduledUpcoming.status === "scheduled"
        ? scheduledUpcoming.sessionNumber
        : nextUnscheduled?.sessionNumber ?? Math.min(completedCount + 1, totalSessions);

  return (
    <div className={cn("layout-stack-sm", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="type-body text-ink">
          Session {Math.max(currentSessionNumber, 1)} of {totalSessions}
        </p>
        <p className="type-caption text-ink-subtle">
          {completedCount} completed
        </p>
      </div>
      <div className="flex items-center gap-2" aria-hidden>
        {timeline.map((slot) => (
          <span
            key={slot.sessionNumber}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              slot.status === "completed"
                ? "bg-accent"
                : slot.status === "scheduled"
                  ? "bg-accent/40"
                  : "bg-border-subtle",
            )}
          />
        ))}
      </div>
    </div>
  );
}
