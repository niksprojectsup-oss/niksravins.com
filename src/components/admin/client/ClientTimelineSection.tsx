import { formatAdminDateTime } from "@/lib/admin/format";
import type { ClientTimelineEvent } from "@/lib/admin/client-types";

const TYPE_LABELS: Record<ClientTimelineEvent["type"], string> = {
  client: "Profile",
  booking: "Booking",
  session: "Session",
};

export function ClientTimelineSection({
  events,
}: {
  events: ClientTimelineEvent[];
}) {
  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Timeline</h2>
      {events.length > 0 ? (
        <ol className="mt-6 layout-stack-md">
          {events.map((event) => (
            <li
              key={event.id}
              className="relative border-l border-border-subtle pl-6 pb-1 last:pb-0"
            >
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent" />
              <p className="type-caption text-ink-subtle">
                {TYPE_LABELS[event.type]} · {formatAdminDateTime(event.occurredAt)}
              </p>
              <p className="type-body mt-1 text-ink">{event.title}</p>
              {event.description ? (
                <p className="type-body mt-2 text-ink-subtle">{event.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="type-body mt-4 text-ink-subtle">No timeline events yet.</p>
      )}
    </section>
  );
}
