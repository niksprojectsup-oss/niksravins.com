import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { adminPages } from "@/content/admin";
import { formatAdminDateTime, formatCurrency } from "@/lib/admin/mock-data";
import {
  getDashboardStats,
  getSessionsForDay,
  getUpcomingSessions,
} from "@/lib/admin/session-repository";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminDashboardPage() {
  const [stats, upcoming, todaySessions, weekSessions] = await Promise.all([
    getDashboardStats(),
    getUpcomingSessions(4),
    getSessionsForDay(todayKey()),
    getUpcomingSessions(20),
  ]);

  const week = weekSessions.filter((session) => session.status === "scheduled");

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.dashboard.title}
        description={adminPages.dashboard.description}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Upcoming sessions"
          value={String(stats.upcomingCount)}
        />
        <AdminStatCard label="Today" value={String(stats.todayCount)} />
        <AdminStatCard label="This week" value={String(stats.weekCount)} />
        <AdminStatCard
          label="Revenue overview"
          value={formatCurrency(stats.revenueCents, stats.currency)}
          hint="Paid bookings"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <AdminPanel title="Upcoming sessions">
          <ul className="observed-card divide-y divide-border-subtle">
            {upcoming.length > 0 ? (
              upcoming.map((session) => (
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
              ))
            ) : (
              <li className="px-6 py-5">
                <p className="type-body">No upcoming sessions.</p>
              </li>
            )}
          </ul>
        </AdminPanel>

        <AdminPanel title="Today's sessions">
          <ul className="observed-card divide-y divide-border-subtle">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
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
            {week.length > 0 ? (
              week.map((session) => (
                <li key={session.id} className="px-6 py-5">
                  <p className="type-body text-ink">{session.clientName}</p>
                  <p className="type-caption">
                    {session.serviceTitle} · {formatAdminDateTime(session.scheduledAt)}
                  </p>
                </li>
              ))
            ) : (
              <li className="px-6 py-5">
                <p className="type-body">No sessions scheduled this week.</p>
              </li>
            )}
          </ul>
        </AdminPanel>

        <AdminPanel
          title="Revenue overview"
          description="Paid bookings tracked in the database."
        >
          <div className="observed-card p-6 md:p-7">
            <p className="font-display text-4xl tracking-snug text-ink">
              {formatCurrency(stats.revenueCents, stats.currency)}
            </p>
            <p className="type-body mt-4">
              Revenue updates as payments are marked paid.
            </p>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
