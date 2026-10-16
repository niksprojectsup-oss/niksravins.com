import Link from "next/link";
import type { PortalContent } from "@/content/i18n/portal";
import type { PackageSessionSlot } from "@/lib/admin/client-types";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";

type JourneyTimelineProps = {
  timeline: PackageSessionSlot[];
  packageId: string;
  totalSessions: number;
  timezone: string;
  copy: PortalContent["journeyPage"];
  prepareLabel: string;
  bookLabel: string;
};

function slotAction(
  slot: PackageSessionSlot,
  packageId: string,
  isNextBookable: boolean,
  copy: PortalContent["journeyPage"],
  prepareLabel: string,
  bookLabel: string,
): { kind: "link" | "done" | "waiting"; label: string; href?: string } {
  if (slot.status === "completed") {
    return { kind: "done", label: copy.completed, href: `/client/sessions?session=${slot.sessionId}` };
  }
  if (slot.status === "scheduled") {
    return { kind: "link", label: prepareLabel, href: "/client/dashboard#focus" };
  }
  if (isNextBookable) {
    return { kind: "link", label: bookLabel, href: `/client/packages/${packageId}/book` };
  }
  return { kind: "waiting", label: copy.notScheduled };
}

export function JourneyTimeline({
  timeline,
  packageId,
  totalSessions,
  timezone,
  copy,
  prepareLabel,
  bookLabel,
}: JourneyTimelineProps) {
  const firstUnscheduled = timeline.find((s) => s.status === "not_scheduled");

  return (
    <ol className="layout-stack-md">
      {timeline.map((slot, index) => {
        const isNextBookable = firstUnscheduled?.sessionNumber === slot.sessionNumber;
        const action = slotAction(slot, packageId, isNextBookable, copy, prepareLabel, bookLabel);
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
              {!isLast ? <span className="mt-1 w-px flex-1 bg-border-subtle" aria-hidden /> : null}
            </div>

            <div className="min-w-0 flex-1 pb-6">
              <p className="type-body text-ink">
                {copy.sessionProgress
                  .replaceAll("{current}", String(slot.sessionNumber))
                  .replaceAll("{total}", String(totalSessions))}
              </p>
              {slot.scheduledAt ? (
                <p className="type-caption mt-1">
                  {formatPortalSessionDateTime(slot.scheduledAt, timezone)}
                </p>
              ) : (
                <p className="type-caption mt-1 text-ink-faint">{copy.notScheduled}</p>
              )}
              {action.kind === "link" && action.href ? (
                <Link href={action.href} className="type-accent-link mt-2 inline-block">
                  {action.label}
                </Link>
              ) : (
                <p className={`type-caption mt-2 ${action.kind === "done" ? "text-accent" : "text-ink-faint"}`}>
                  {action.label}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
