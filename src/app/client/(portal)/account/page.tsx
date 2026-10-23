import { ClientLogoutButton } from "@/components/client/ClientLogoutButton";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

export default async function ClientAccountPage() {
  const session = await requireClient();
  const content = getPortalContent(await getPortalLocale());
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
    <div className="portal-stack max-w-prose">
      <header className="layout-stack-sm">
        <h1 className="portal-page-title text-[#2c2824]">{content.account.title}</h1>
        <p className="max-w-2xl text-[#6d675f]">{content.account.subtitle}</p>
      </header>

      <section className="portal-card p-5">
        <dl className="layout-stack-md">
          <div>
            <dt className="text-sm text-[#6d675f]">{content.account.name}</dt>
            <dd className="mt-1 text-[#2c2824]">
              {client.firstName} {client.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[#6d675f]">{content.account.email}</dt>
            <dd className="mt-1 text-[#2c2824]">{client.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#6d675f]">{content.account.timezone}</dt>
            <dd className="mt-1 text-[#2c2824]">{client.timezone}</dd>
          </div>
        </dl>
      </section>

      <ClientLogoutButton label={content.account.signOut} />
    </div>
  );
}
