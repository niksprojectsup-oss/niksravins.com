import Link from "next/link";
import { ClientLogoutButton } from "@/components/client/ClientLogoutButton";
import { Button } from "@/components/ui/Button";
import { clientPortalContent } from "@/content/client-portal";
import {
  formatPortalSessionDateTime,
  type PortalDashboard,
  type PortalPackageSummary,
} from "@/lib/client/portal-repository";
import type { PackageSessionSlot } from "@/lib/admin/client-types";

type ClientDashboardViewProps = {
  dashboard: PortalDashboard;
  timezone: string;
};

function SessionCard({
  session,
  timezone,
}: {
  session: PortalDashboard["nextSession"];
  timezone: string;
}) {
  if (!session) {
    return (
      <p className="type-body text-ink-subtle">{clientPortalContent.dashboard.noNextSession}</p>
    );
  }

  return (
    <div className="observed-card p-6 md:p-7">
      <p className="type-body text-ink">{session.sessionType}</p>
      <p className="type-caption mt-2">
        {formatPortalSessionDateTime(session.scheduledAt, timezone)}
      </p>
      {session.sessionNumber ? (
        <p className="type-caption mt-1">Session {session.sessionNumber}</p>
      ) : null}
    </div>
  );
}

function PackageTimeline({
  pkg,
  timezone,
}: {
  pkg: PortalPackageSummary;
  timezone: string;
}) {
  const firstUnscheduled = pkg.timeline.find((slot) => slot.status === "not_scheduled");

  return (
    <div className="observed-card p-6 md:p-7">
      <p className="type-body text-ink">{pkg.serviceTitle}</p>
      <ul className="mt-6 layout-stack-sm">
        {pkg.timeline.map((slot) => (
          <PackageTimelineRow
            key={slot.sessionNumber}
            slot={slot}
            packageId={pkg.id}
            totalSessions={pkg.totalSessions}
            timezone={timezone}
            isNextBookable={firstUnscheduled?.sessionNumber === slot.sessionNumber}
          />
        ))}
      </ul>
    </div>
  );
}

function PackageTimelineRow({
  slot,
  packageId,
  totalSessions,
  timezone,
  isNextBookable,
}: {
  slot: PackageSessionSlot;
  packageId: string;
  totalSessions: number;
  timezone: string;
  isNextBookable: boolean;
}) {
  if (slot.status === "completed" || slot.status === "scheduled") {
    return (
      <li className="flex flex-col gap-1 border-b border-border-subtle py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption text-ink-subtle">
          Session {slot.sessionNumber} / {totalSessions}
        </p>
        <p className="type-body text-ink">
          <span className="mr-2 text-accent" aria-hidden>
            ✓
          </span>
          {slot.scheduledAt
            ? formatPortalSessionDateTime(slot.scheduledAt, timezone)
            : "Scheduled"}
        </p>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 border-b border-border-subtle py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="type-caption text-ink-subtle">
        Session {slot.sessionNumber} / {totalSessions}
      </p>
      {isNextBookable ? (
        <Link
          href={`/client/packages/${packageId}/book`}
          className="type-accent-link"
        >
          {clientPortalContent.dashboard.bookPackageSession}
        </Link>
      ) : (
        <p className="type-body text-ink-faint">{clientPortalContent.dashboard.awaitingPriorSession}</p>
      )}
    </li>
  );
}

export function ClientDashboardView({ dashboard, timezone }: ClientDashboardViewProps) {
  const activePackages = dashboard.packages.filter((pkg) => pkg.status === "active");
  const hasSingleSessionNeed = !dashboard.nextSession && activePackages.length === 0;

  return (
    <div className="layout-stack-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="type-caption text-accent">{clientPortalContent.dashboard.welcome}</p>
          <h1 className="type-heading mt-2">
            {dashboard.firstName} {dashboard.lastName}
          </h1>
        </div>
        <ClientLogoutButton />
      </div>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">{clientPortalContent.dashboard.nextSession}</h2>
        <SessionCard session={dashboard.nextSession} timezone={timezone} />
      </section>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">{clientPortalContent.dashboard.packages}</h2>
        {activePackages.length > 0 ? (
          <div className="layout-stack-md">
            {activePackages.map((pkg) => (
              <PackageTimeline key={pkg.id} pkg={pkg} timezone={timezone} />
            ))}
          </div>
        ) : (
          <p className="type-body text-ink-subtle">{clientPortalContent.dashboard.noPackages}</p>
        )}
      </section>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">{clientPortalContent.dashboard.previousSessions}</h2>
        {dashboard.previousSessions.length > 0 ? (
          <ul className="observed-card divide-y divide-border-subtle">
            {dashboard.previousSessions.map((session) => (
              <li key={session.id} className="px-6 py-5">
                <p className="type-body text-ink">{session.sessionType}</p>
                <p className="type-caption mt-1">
                  {formatPortalSessionDateTime(session.scheduledAt, timezone)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body text-ink-subtle">
            {clientPortalContent.dashboard.noPreviousSessions}
          </p>
        )}
      </section>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">{clientPortalContent.dashboard.progress}</h2>
        <div className="observed-card p-6 md:p-7">
          {dashboard.progressSummary.highlights.length > 0 ? (
            <ul className="layout-stack-sm">
              {dashboard.progressSummary.highlights.map((item) => (
                <li key={item} className="type-body text-ink">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body text-ink-subtle">
              {clientPortalContent.dashboard.noProgress}
            </p>
          )}
          <p className="type-caption mt-4">
            {dashboard.progressSummary.currentChecked} of{" "}
            {dashboard.progressSummary.currentTotal} progress markers recorded
          </p>
        </div>
      </section>

      {hasSingleSessionNeed ? (
        <div>
          <Button href="/book">{clientPortalContent.dashboard.bookNextSession}</Button>
        </div>
      ) : null}
    </div>
  );
}
