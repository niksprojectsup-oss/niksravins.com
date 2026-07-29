import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
  sessionStatusVariant,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { formatAdminDateTime } from "@/lib/admin/format";
import { listAdminSessions } from "@/lib/admin/session-repository";
import type { AdminSession } from "@/lib/admin/types";

export default async function AdminSessionsPage() {
  const sessions = await listAdminSessions();

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.sessions.title}
        description={adminPages.sessions.description}
      />

      <AdminTable<AdminSession>
        rows={sessions}
        emptyMessage="No sessions yet. Bookings will appear here once submitted."
        columns={[
          {
            key: "client",
            header: "Client",
            cell: (row) => row.clientName,
          },
          {
            key: "date",
            header: "Date",
            cell: (row) => formatAdminDateTime(row.scheduledAt),
          },
          {
            key: "type",
            header: "Session type",
            cell: (row) => row.serviceTitle,
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={row.status}
                variant={sessionStatusVariant(row.status)}
              />
            ),
          },
          {
            key: "notes",
            header: "Notes",
            cell: (row) => row.notes || "—",
            className: "max-w-xs",
          },
        ]}
      />
    </div>
  );
}
