import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
  paymentStatusVariant,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { formatAdminDate, mockClients } from "@/lib/admin/mock-data";
import type { AdminClient } from "@/lib/admin/types";

export default function AdminClientsPage() {
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.clients.title}
        description={adminPages.clients.description}
      />

      <AdminTable<AdminClient>
        rows={mockClients}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => `${row.firstName} ${row.lastName}`,
          },
          {
            key: "email",
            header: "Email",
            cell: (row) => row.email,
          },
          {
            key: "country",
            header: "Country",
            cell: (row) => row.country,
          },
          {
            key: "sessions",
            header: "Sessions",
            cell: (row) => row.sessionsCount,
          },
          {
            key: "lastSession",
            header: "Last session",
            cell: (row) =>
              row.lastSessionAt ? formatAdminDate(row.lastSessionAt) : "—",
          },
          {
            key: "paymentStatus",
            header: "Payment status",
            cell: (row) => (
              <AdminStatusBadge
                label={row.paymentStatus}
                variant={paymentStatusVariant(row.paymentStatus)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
