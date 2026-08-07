import { ClientLogoutButton } from "@/components/client/ClientLogoutButton";
import { Button } from "@/components/ui/Button";
import { clientPortalContent } from "@/content/client-portal";
import {
  formatPortalSessionDateTime,
  type PortalDashboard,
} from "@/lib/client/portal-repository";

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
    return <p className="type-body text-ink-subtle">{clientPortalContent.dashboard.noNextSession}</p>;
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

export function ClientDashboardView({ dashboard, timezone }: ClientDashboardViewProps) {
  const activePackages = dashboard.packages.filter((pkg) => pkg.status === "active");
  const totalRemaining = activePackages.reduce(
    (sum, pkg) => sum + pkg.remainingSessions,
    0,
  );

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activePackages.map((pkg) => (
              <div key={pkg.id} className="observed-card p-6 md:p-7">
                <p className="type-body text-ink">{pkg.serviceTitle}</p>
                <p className="type-caption mt-2">
                  {pkg.remainingSessions} {clientPortalContent.dashboard.remainingSessions}{" "}
                  · {pkg.completedSessions}/{pkg.totalSessions} completed
                </p>
              </div>
            ))}
          </div>
        ) : totalRemaining > 0 ? (
          <p className="type-body">{totalRemaining} package sessions remaining.</p>
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

      <div>
        <Button href="/book">{clientPortalContent.dashboard.bookNextSession}</Button>
      </div>
    </div>
  );
}
