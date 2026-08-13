import { notFound } from "next/navigation";
import { PortalPageHeader } from "@/components/client/journey/PortalPageHeader";
import { SessionsPanel } from "@/components/client/journey/SessionsPanel";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyPageData, listClientSessionsWithReflections } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

type ClientSessionsPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ClientSessionsPage({ searchParams }: ClientSessionsPageProps) {
  const session = await requireClient();
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
    <div className="layout-stack-xl">
      <PortalPageHeader
        title="Sessions"
        description="Your session history, reflections, and next steps."
      />
      <SessionsPanel
        sessions={sessions}
        timezone={client.timezone}
        highlightSessionId={params.session}
        packageId={journey.activePackage?.id}
      />
    </div>
  );
}
