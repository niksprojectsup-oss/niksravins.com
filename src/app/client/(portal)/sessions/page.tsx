import { notFound } from "next/navigation";
import { SessionsPanel } from "@/components/client/journey/SessionsPanel";
import { PortalIconBadge } from "@/components/client/portal/PortalIcon";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { getJourneyPageData, listClientSessionsWithReflections } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

type ClientSessionsPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ClientSessionsPage({ searchParams }: ClientSessionsPageProps) {
  const session = await requireClient();
  const content = getPortalContent(await getPortalLocale());
  const params = await searchParams;
  const [client, sessions, journey] = await Promise.all([
    prisma.client.findUnique({
      where: { id: session.clientId! },
      select: { timezone: true },
    }),
    listClientSessionsWithReflections(session.clientId!),
    getJourneyPageData(session.clientId!),
  ]);

  if (!client) notFound();

  return (
    <div className="portal-stack">
      <header className="flex items-start gap-3">
        <PortalIconBadge name="calendar" tone="sand" />
        <div className="layout-stack-sm min-w-0">
          <h1 className="portal-page-title text-[#2c2824]">{content.sessionsPage.title}</h1>
          <p className="max-w-2xl text-[#6d675f]">{content.sessionsPage.description}</p>
        </div>
      </header>
      <SessionsPanel
        sessions={sessions}
        timezone={client.timezone}
        highlightSessionId={params.session}
        packageId={journey.activePackage?.id}
        copy={content.sessionsPage}
        now={new Date().toISOString()}
      />
    </div>
  );
}
