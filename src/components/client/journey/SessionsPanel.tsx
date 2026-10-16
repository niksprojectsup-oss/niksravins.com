import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SessionReflectionForm } from "@/components/client/journey/SessionReflectionForm";
import { PortalCard, PortalGrid } from "@/components/client/journey/PortalShell";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";
import type { PortalContent } from "@/content/i18n/portal";
import type { JourneySessionListItem } from "@/lib/journey/journey-repository";

type SessionsPanelProps = {
  sessions: JourneySessionListItem[];
  timezone: string;
  highlightSessionId?: string;
  packageId?: string | null;
  copy: PortalContent["sessionsPage"];
  now: string;
};

export function SessionsPanel({
  sessions,
  timezone,
  highlightSessionId,
  packageId,
  copy,
  now,
}: SessionsPanelProps) {
  const nowMs = new Date(now).getTime();
  const upcoming = sessions.filter(
    (s) => s.status === "SCHEDULED" && new Date(s.scheduledAt).getTime() > nowMs,
  );
  const past = sessions.filter((s) => !upcoming.some((u) => u.id === s.id));

  return (
    <div className="layout-stack-lg">
      {upcoming.length > 0 ? (
        <section className="layout-stack-md">
          <h2 className="type-heading-sm">{copy.upcoming}</h2>
          <PortalGrid columns={1}>
            {upcoming.map((session) => (
              <PortalCard key={session.id}>
                <p className="type-label text-accent">
                  {session.sessionNumber
                    ? copy.sessionNumber.replaceAll("{number}", String(session.sessionNumber))
                    : copy.upcomingSession}
                </p>
                <p className="type-body mt-2 text-ink">{session.sessionType}</p>
                <p className="type-caption mt-2">
                  {formatPortalSessionDateTime(session.scheduledAt, timezone)}
                </p>
                <Link href="/client/dashboard#focus" className="type-accent-link mt-4 inline-block">
                  {copy.prepare}
                </Link>
              </PortalCard>
            ))}
          </PortalGrid>
        </section>
      ) : packageId ? (
        <PortalCard className="border-accent/20 bg-accent/5">
          <p className="type-body text-ink">{copy.bookPrompt}</p>
          <Button href={`/client/packages/${packageId}/book`} className="mt-4">
            {copy.book}
          </Button>
        </PortalCard>
      ) : null}

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">{copy.past}</h2>
        {past.length === 0 ? (
          <PortalCard>
            <p className="type-body text-ink-subtle">{copy.empty}</p>
          </PortalCard>
        ) : (
          <div className="layout-stack-md">
            {past.map((session) => (
              <div key={session.id} className="layout-stack-sm">
                <PortalCard>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="type-label text-accent">
                        {session.sessionNumber
                          ? copy.sessionNumber.replaceAll("{number}", String(session.sessionNumber))
                          : session.sessionType}
                      </p>
                      <p className="type-body mt-2 text-ink">{session.sessionType}</p>
                      <p className="type-caption mt-2">
                        {formatPortalSessionDateTime(session.scheduledAt, timezone)} ·{" "}
                        {session.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    {session.reflection ? (
                      <div className="rounded-xl bg-surface px-4 py-3 text-right">
                        <p className="type-caption">{copy.reflection}</p>
                        <p className="type-body mt-1">{session.reflection.rating}/5</p>
                      </div>
                    ) : null}
                  </div>
                  {session.reflection?.takeaway ? (
                    <p className="type-body mt-4 text-ink-subtle">
                      <span className="text-ink">{copy.takeaway}: </span>
                      {session.reflection.takeaway}
                    </p>
                  ) : null}
                </PortalCard>

                {session.needsReflection || highlightSessionId === session.id ? (
                  <SessionReflectionForm
                    sessionId={session.id}
                    sessionLabel={`${session.sessionType} · ${formatPortalSessionDateTime(session.scheduledAt, timezone)}`}
                    existing={session.reflection}
                    copy={copy}
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
