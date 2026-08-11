import Link from "next/link";
import { SessionReflectionForm } from "@/components/client/journey/SessionReflectionForm";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";
import type { JourneySessionListItem } from "@/lib/journey/journey-repository";

type SessionsPanelProps = {
  sessions: JourneySessionListItem[];
  timezone: string;
  highlightSessionId?: string;
};

export function SessionsPanel({
  sessions,
  timezone,
  highlightSessionId,
}: SessionsPanelProps) {
  const upcoming = sessions.filter(
    (s) => s.status === "SCHEDULED" && new Date(s.scheduledAt).getTime() > Date.now(),
  );
  const past = sessions.filter((s) => !upcoming.some((u) => u.id === s.id));

  return (
    <div className="layout-stack-lg">
      {upcoming.length > 0 ? (
        <section>
          <h2 className="type-heading-sm">Upcoming</h2>
          <ul className="mt-4 layout-stack-md">
            {upcoming.map((session) => (
              <li key={session.id} className="observed-card p-6">
                <p className="type-body text-ink">
                  {session.sessionType}
                  {session.sessionNumber ? ` · Session ${session.sessionNumber}` : ""}
                </p>
                <p className="type-caption mt-2">
                  {formatPortalSessionDateTime(session.scheduledAt, timezone)}
                </p>
                <Link href="/client/dashboard#next-session" className="type-accent-link mt-3 inline-block">
                  Prepare for session
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="type-heading-sm">Session history</h2>
        {past.length === 0 ? (
          <p className="type-body mt-4 text-ink-subtle">No sessions yet.</p>
        ) : (
          <div className="mt-4 layout-stack-lg">
            {past.map((session) => (
              <div key={session.id} className="layout-stack-md">
                <div className="observed-card p-6">
                  <p className="type-body text-ink">
                    {session.sessionType}
                    {session.sessionNumber ? ` · Session ${session.sessionNumber}` : ""}
                  </p>
                  <p className="type-caption mt-2">
                    {formatPortalSessionDateTime(session.scheduledAt, timezone)} · {session.status.toLowerCase()}
                  </p>
                </div>
                {session.needsReflection || highlightSessionId === session.id ? (
                  <SessionReflectionForm
                    sessionId={session.id}
                    sessionLabel={`${session.sessionType} · ${formatPortalSessionDateTime(session.scheduledAt, timezone)}`}
                    existing={session.reflection}
                  />
                ) : session.reflection ? (
                  <div className="observed-card p-6">
                    <p className="type-label text-accent">Your reflection</p>
                    <p className="type-caption mt-2">Rating: {session.reflection.rating}/5</p>
                    {session.reflection.takeaway ? (
                      <p className="type-body mt-4">{session.reflection.takeaway}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
