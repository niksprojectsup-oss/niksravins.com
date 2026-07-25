import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
  paymentStatusVariant,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { adminPages } from "@/content/admin";
import { listClientRecords } from "@/lib/admin/client-repository";
import type { ClientListItem } from "@/lib/admin/client-types";
import { formatAdminDate } from "@/lib/admin/mock-data";

export default async function AdminClientsPage() {
  const clients = await listClientRecords();

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.clients.title}
        description={adminPages.clients.description}
      />

      <AdminTable<ClientListItem>
        rows={clients}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <Link
                href={`/admin/clients/${row.id}`}
                className="type-accent-link no-underline hover:underline"
              >
                {row.firstName} {row.lastName}
              </Link>
            ),
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
