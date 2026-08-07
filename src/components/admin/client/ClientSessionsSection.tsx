import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatAdminDateTimeWithClient } from "@/lib/admin/format";
import type { ClientSessionNote } from "@/lib/admin/client-types";

function SessionList({
  sessions,
  emptyMessage,
  clientTimezone,
}: {
  sessions: ClientSessionNote[];
  emptyMessage: string;
  clientTimezone?: string;
}) {
  if (sessions.length === 0) {
    return <p className="type-body">{emptyMessage}</p>;
  }

  return (
    <ul className="layout-stack-md">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="border-t border-border-subtle pt-4 first:border-t-0 first:pt-0"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="type-body text-ink">
                {session.sessionType}
                {session.sessionNumber ? ` · Session ${session.sessionNumber}` : ""}
                {" · "}
                {formatAdminDateTimeWithClient(session.scheduledAt, clientTimezone)}
              </p>
              {session.mainTopic ? (
                <p className="type-caption mt-1">Topic: {session.mainTopic}</p>
              ) : null}
            </div>
            <AdminStatusBadge
              label={session.status.toLowerCase().replace("_", "-")}
              variant={session.status === "SCHEDULED" ? "accent" : "default"}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ClientSessionsSection({
  upcomingSessions,
  completedSessions,
  clientTimezone,
}: {
  upcomingSessions: ClientSessionNote[];
  completedSessions: ClientSessionNote[];
  clientTimezone?: string;
}) {
  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Sessions</h2>

      <div className="mt-8 layout-stack-lg">
        <div>
          <h3 className="type-label">Upcoming sessions</h3>
          <div className="mt-4">
            <SessionList
              sessions={upcomingSessions}
              emptyMessage="No upcoming sessions scheduled."
              clientTimezone={clientTimezone}
            />
          </div>
        </div>

        <div className="border-t border-border-subtle pt-8">
          <h3 className="type-label">Completed sessions</h3>
          <div className="mt-4">
            <SessionList
              sessions={completedSessions}
              emptyMessage="No completed sessions yet."
              clientTimezone={clientTimezone}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
