import Link from "next/link";
import type { PackageSessionSlot } from "@/lib/admin/client-types";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";

type JourneyTimelineProps = {
  timeline: PackageSessionSlot[];
  packageId: string;
  totalSessions: number;
  timezone: string;
};

function slotAction(
  slot: PackageSessionSlot,
  packageId: string,
  isNextBookable: boolean,
): { label: string; href?: string } {
  if (slot.status === "completed") {
    return { label: "Completed", href: `/client/sessions?session=${slot.sessionId}` };
  }
  if (slot.status === "scheduled") {
    return { label: "Prepare for session", href: `/client/dashboard#next-session` };
  }
  if (isNextBookable) {
    return { label: "Book next session", href: `/client/packages/${packageId}/book` };
  }
  return { label: "Not yet scheduled" };
}

export function JourneyTimeline({
  timeline,
  packageId,
  totalSessions,
  timezone,
}: JourneyTimelineProps) {
  const firstUnscheduled = timeline.find((s) => s.status === "not_scheduled");

  return (
    <ol className="layout-stack-md">
      {timeline.map((slot, index) => {
        const isNextBookable =
          firstUnscheduled?.sessionNumber === slot.sessionNumber;
        const action = slotAction(slot, packageId, isNextBookable);
        const isLast = index === timeline.length - 1;

        return (
          <li key={slot.sessionNumber} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                  slot.status === "completed"
                    ? "border-accent bg-accent/10 text-accent"
                    : slot.status === "scheduled"
                      ? "border-accent text-accent"
                      : "border-border-subtle text-ink-faint"
                }`}
                aria-hidden
              >
                {slot.status === "completed" ? "✓" : slot.sessionNumber}
              </span>
              {!isLast ? (
                <span className="mt-1 w-px flex-1 bg-border-subtle" aria-hidden />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pb-6">
              <p className="type-body text-ink">
                Session {slot.sessionNumber}
                <span className="type-caption ml-2 text-ink-subtle">
                  of {totalSessions}
                </span>
              </p>
              {slot.scheduledAt ? (
                <p className="type-caption mt-1">
                  {formatPortalSessionDateTime(slot.scheduledAt, timezone)}
                </p>
              ) : (
                <p className="type-caption mt-1 text-ink-faint">
                  {slot.status === "not_scheduled"
                    ? "Not yet scheduled"
                    : slot.status.replace("_", " ")}
                </p>
              )}
              {action.href && action.label !== "Completed" ? (
                <Link href={action.href} className="type-accent-link mt-2 inline-block">
                  {action.label}
                </Link>
              ) : action.label === "Completed" ? (
                <p className="type-caption mt-2 text-accent">{action.label}</p>
              ) : (
                <p className="type-caption mt-2 text-ink-faint">{action.label}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
