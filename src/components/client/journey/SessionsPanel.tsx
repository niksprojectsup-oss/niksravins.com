import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SessionReflectionForm } from "@/components/client/journey/SessionReflectionForm";
import { PortalCard, PortalGrid } from "@/components/client/journey/PortalShell";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";
import type { JourneySessionListItem } from "@/lib/journey/journey-repository";

type SessionsPanelProps = {
  sessions: JourneySessionListItem[];
  timezone: string;
  highlightSessionId?: string;
  packageId?: string | null;
};

export function SessionsPanel({
  sessions,
  timezone,
  highlightSessionId,
  packageId,
}: SessionsPanelProps) {
  const now = Date.now();
  const upcoming = sessions.filter(
    (s) => s.status === "SCHEDULED" && new Date(s.scheduledAt).getTime() > now,
  );
  const past = sessions.filter((s) => !upcoming.some((u) => u.id === s.id));

  return (
    <div className="layout-stack-lg">
      {upcoming.length > 0 ? (
        <section className="layout-stack-md">
          <h2 className="type-heading-sm">Upcoming</h2>
          <PortalGrid columns={1}>
            {upcoming.map((session) => (
              <PortalCard key={session.id}>
                <p className="type-label text-accent">
                  {session.sessionNumber ? `Session ${session.sessionNumber}` : "Upcoming session"}
                </p>
                <p className="type-body mt-2 text-ink">{session.sessionType}</p>
                <p className="type-caption mt-2">
                  {formatPortalSessionDateTime(session.scheduledAt, timezone)}
                </p>
                <Link href="/client/dashboard#next-session" className="type-accent-link mt-4 inline-block">
                  Prepare for session
                </Link>
              </PortalCard>
            ))}
          </PortalGrid>
        </section>
      ) : packageId ? (
        <PortalCard className="border-accent/20 bg-accent/5">
          <p className="type-body text-ink">Ready for your next step?</p>
          <p className="type-caption mt-2 text-ink-subtle">
            Book your next package session when you&apos;re ready to continue.
          </p>
          <Button href={`/client/packages/${packageId}/book`} className="mt-4">
            Book next session
          </Button>
        </PortalCard>
      ) : null}

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">Your session journey</h2>
        {past.length === 0 ? (
          <PortalCard>
            <p className="type-body text-ink-subtle">No sessions yet.</p>
          </PortalCard>
        ) : (
          <div className="layout-stack-md">
            {past.map((session) => (
              <div key={session.id} className="layout-stack-sm">
                <PortalCard>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="type-label text-accent">
                        {session.sessionNumber ? `Session ${session.sessionNumber}` : session.sessionType}
                      </p>
                      <p className="type-body mt-2 text-ink">{session.sessionType}</p>
                      <p className="type-caption mt-2">
                        {formatPortalSessionDateTime(session.scheduledAt, timezone)} ·{" "}
                        {session.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    {session.reflection ? (
                      <div className="rounded-xl bg-surface px-4 py-3 text-right">
                        <p className="type-caption">Reflection</p>
                        <p className="type-body mt-1">{session.reflection.rating}/5</p>
                      </div>
                    ) : null}
                  </div>
                  {session.reflection?.takeaway ? (
                    <p className="type-body mt-4 text-ink-subtle">
                      <span className="text-ink">Takeaway: </span>
                      {session.reflection.takeaway}
                    </p>
                  ) : null}
                </PortalCard>

                {session.needsReflection || highlightSessionId === session.id ? (
                  <SessionReflectionForm
                    sessionId={session.id}
                    sessionLabel={`${session.sessionType} · ${formatPortalSessionDateTime(session.scheduledAt, timezone)}`}
                    existing={session.reflection}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
