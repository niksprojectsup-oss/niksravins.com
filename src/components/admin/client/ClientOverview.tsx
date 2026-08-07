import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatAdminDate } from "@/lib/admin/format";
import type { ClientWorkspace } from "@/lib/admin/client-types";

export function ClientOverview({ client }: { client: ClientWorkspace }) {
  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Client overview</h2>
      <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <dt className="type-caption">First name</dt>
          <dd className="type-body mt-1 text-ink">{client.firstName}</dd>
        </div>
        <div>
          <dt className="type-caption">Last name</dt>
          <dd className="type-body mt-1 text-ink">{client.lastName}</dd>
        </div>
        <div>
          <dt className="type-caption">Email</dt>
          <dd className="type-body mt-1 text-ink">{client.email}</dd>
        </div>
        <div>
          <dt className="type-caption">Phone</dt>
          <dd className="type-body mt-1 text-ink">{client.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="type-caption">Country</dt>
          <dd className="type-body mt-1 text-ink">{client.country}</dd>
        </div>
        <div>
          <dt className="type-caption">Status</dt>
          <dd className="mt-1">
            <AdminStatusBadge label={String(client.status).toLowerCase()} variant="accent" />
          </dd>
        </div>
        <div>
          <dt className="type-caption">Client since</dt>
          <dd className="type-body mt-1 text-ink">
            {formatAdminDate(client.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="type-caption">First session date</dt>
          <dd className="type-body mt-1 text-ink">
            {client.firstSessionDate
              ? formatAdminDate(client.firstSessionDate)
              : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function ClientProfileHeader({ client }: { client: ClientWorkspace }) {
  return (
    <header className="layout-stack-sm border-b border-border-subtle pb-6">
      <Link
        href="/admin/clients"
        className="type-caption text-ink-subtle no-underline hover:text-accent"
      >
        ← Clients
      </Link>
      <p className="type-label">Client profile</p>
      <h1 className="type-heading-sm md:text-3xl">
        {client.firstName} {client.lastName}
      </h1>
      <p className="type-body">{client.email}</p>
    </header>
  );
}
