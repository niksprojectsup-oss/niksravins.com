import { ClientLogoutButton } from "@/components/client/ClientLogoutButton";
import { requireClient } from "@/lib/auth/client-guards";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

export default async function ClientAccountPage() {
  const session = await requireClient();
  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      timezone: true,
    },
  });

  if (!client) notFound();

  return (
    <div className="layout-stack-xl max-w-prose">
      <header className="layout-stack-sm">
        <h1 className="type-heading">Account</h1>
        <p className="type-body text-ink-subtle">Your profile and sign-in.</p>
      </header>

      <section className="observed-card p-6 md:p-8">
        <dl className="layout-stack-md">
          <div>
            <dt className="type-caption">Name</dt>
            <dd className="type-body mt-1">
              {client.firstName} {client.lastName}
            </dd>
          </div>
          <div>
            <dt className="type-caption">Email</dt>
            <dd className="type-body mt-1">{client.email}</dd>
          </div>
          <div>
            <dt className="type-caption">Timezone</dt>
            <dd className="type-body mt-1">{client.timezone}</dd>
          </div>
        </dl>
      </section>

      <ClientLogoutButton />
    </div>
  );
}
