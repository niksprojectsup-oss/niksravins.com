import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminStatusBadge,
  clientStatusVariant,
} from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { ClientsToolbar } from "@/components/admin/ClientsToolbar";
import { adminPages } from "@/content/admin";
import { listClientRecords } from "@/lib/admin/client-repository";
import type { ClientListItem, ClientListSort } from "@/lib/admin/client-types";
import { formatAdminDate } from "@/lib/admin/mock-data";

type AdminClientsPageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

function parseSort(value?: string): ClientListSort {
  if (
    value === "newest" ||
    value === "alphabetical" ||
    value === "last_session" ||
    value === "next_session"
  ) {
    return value;
  }
  return "alphabetical";
}

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  const params = await searchParams;
  const clients = await listClientRecords({
    search: params.q,
    sort: parseSort(params.sort),
  });

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={adminPages.clients.title}
        description={adminPages.clients.description}
      />

      <Suspense fallback={null}>
        <ClientsToolbar />
      </Suspense>

      <AdminTable<ClientListItem>
        rows={clients}
        emptyMessage={
          params.q
            ? "No clients match your search."
            : "No clients yet. Bookings will appear here once submitted."
        }
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
            header: "Total sessions",
            cell: (row) => row.sessionsCount,
          },
          {
            key: "nextSession",
            header: "Next session",
            cell: (row) =>
              row.nextSessionAt ? formatAdminDate(row.nextSessionAt) : "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <AdminStatusBadge
                label={String(row.status).toLowerCase()}
                variant={clientStatusVariant(String(row.status))}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
