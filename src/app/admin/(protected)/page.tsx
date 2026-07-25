import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { adminPages } from "@/content/admin";
import {
  formatAdminDateTime,
  formatCurrency,
  mockDashboardStats,
  mockSessions,
} from "@/lib/admin/mock-data";

export default function AdminDashboardPage() {
  const upcoming = mockSessions
    .filter((session) => session.status === "scheduled")
    .slice(0, 4);

  const today = mockSessions.filter((session) =>
    session.scheduledAt.startsWith("2026-07-26"),
  );

  const week = mockSessions.filter((session) => session.status === "scheduled");

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.dashboard.title}
        description={adminPages.dashboard.description}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Upcoming sessions"
          value={String(mockDashboardStats.upcomingCount)}
        />
        <AdminStatCard
          label="Today"
          value={String(mockDashboardStats.todayCount)}
        />
        <AdminStatCard
          label="This week"
          value={String(mockDashboardStats.weekCount)}
        />
        <AdminStatCard
          label="Revenue overview"
          value={formatCurrency(
            mockDashboardStats.revenueCents,
            mockDashboardStats.currency,
          )}
          hint="Placeholder total"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <AdminPanel title="Upcoming sessions">
          <ul className="observed-card divide-y divide-border-subtle">
            {upcoming.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="type-body text-ink">{session.clientName}</p>
                  <p className="type-caption">
                    {session.serviceTitle} · {formatAdminDateTime(session.scheduledAt)}
                  </p>
                </div>
                <AdminStatusBadge label={session.status} variant="accent" />
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel title="Today's sessions">
          <ul className="observed-card divide-y divide-border-subtle">
            {today.length > 0 ? (
              today.map((session) => (
                <li key={session.id} className="px-6 py-5">
                  <p className="type-body text-ink">{session.clientName}</p>
                  <p className="type-caption">
                    {formatAdminDateTime(session.scheduledAt)}
                  </p>
                </li>
              ))
            ) : (
              <li className="px-6 py-5">
                <p className="type-body">No sessions scheduled for today.</p>
              </li>
            )}
          </ul>
        </AdminPanel>

        <AdminPanel title="This week">
          <ul className="observed-card divide-y divide-border-subtle">
            {week.map((session) => (
              <li key={session.id} className="px-6 py-5">
                <p className="type-body text-ink">{session.clientName}</p>
                <p className="type-caption">
                  {session.serviceTitle} · {formatAdminDateTime(session.scheduledAt)}
                </p>
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel
          title="Revenue overview"
          description="Placeholder summary until Stripe integration is connected."
        >
          <div className="observed-card p-6 md:p-7">
            <p className="font-display text-4xl tracking-snug text-ink">
              {formatCurrency(
                mockDashboardStats.revenueCents,
                mockDashboardStats.currency,
              )}
            </p>
            <p className="type-body mt-4">
              Tracked payments will appear here once Stripe and PayPal are
              connected to the booking flow.
            </p>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
