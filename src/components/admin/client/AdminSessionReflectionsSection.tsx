import { formatAdminDateTimeWithClient } from "@/lib/admin/format";
import type { ClientSessionNote } from "@/lib/admin/client-types";
import type { AdminSharedSessionReflection } from "@/lib/journey/admin-journey-repository";

export function AdminSessionReflectionsSection({
  sessions,
  reflections,
  clientTimezone,
}: {
  sessions: ClientSessionNote[];
  reflections: AdminSharedSessionReflection[];
  clientTimezone?: string;
}) {
  const reflectionBySession = new Map(reflections.map((r) => [r.sessionId, r]));
  const completedWithShared = sessions.filter(
    (s) => s.status === "COMPLETED" && reflectionBySession.has(s.id),
  );

  if (completedWithShared.length === 0) {
    return null;
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Client reflections (shared)</h2>
      <ul className="mt-6 layout-stack-lg">
        {completedWithShared.map((session) => {
          const reflection = reflectionBySession.get(session.id)!;
          return (
            <li key={session.id} className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
              <p className="type-body text-ink">
                {session.sessionType}
                {session.sessionNumber ? ` · Session ${session.sessionNumber}` : ""}
                {" · "}
                {formatAdminDateTimeWithClient(session.scheduledAt, clientTimezone)}
              </p>
              <dl className="mt-4 layout-stack-sm">
                <div>
                  <dt className="type-caption">Rating</dt>
                  <dd className="type-body">{reflection.rating}/5</dd>
                </div>
                {reflection.valuablePart ? (
                  <div>
                    <dt className="type-caption">Most valuable</dt>
                    <dd className="type-body">{reflection.valuablePart}</dd>
                  </div>
                ) : null}
                {reflection.whatShifted ? (
                  <div>
                    <dt className="type-caption">What shifted</dt>
                    <dd className="type-body">{reflection.whatShifted}</dd>
                  </div>
                ) : null}
                {reflection.takeaway ? (
                  <div>
                    <dt className="type-caption">Takeaway</dt>
                    <dd className="type-body">{reflection.takeaway}</dd>
                  </div>
                ) : null}
                {reflection.messageToPractitioner ? (
                  <div>
                    <dt className="type-caption">Message to practitioner</dt>
                    <dd className="type-body">{reflection.messageToPractitioner}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
