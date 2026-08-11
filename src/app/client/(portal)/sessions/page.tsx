import { notFound } from "next/navigation";
import { SessionsPanel } from "@/components/client/journey/SessionsPanel";
import { requireClient } from "@/lib/auth/client-guards";
import { listClientSessionsWithReflections } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

type ClientSessionsPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ClientSessionsPage({ searchParams }: ClientSessionsPageProps) {
  const session = await requireClient();
  const params = await searchParams;
  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: { timezone: true },
  });
  if (!client) notFound();

  const sessions = await listClientSessionsWithReflections(session.clientId!);

  return (
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <h1 className="type-heading">Sessions</h1>
        <p className="type-body text-ink-subtle">
          Your session history and reflections.
        </p>
      </header>
      <SessionsPanel
        sessions={sessions}
        timezone={client.timezone}
        highlightSessionId={params.session}
      />
    </div>
  );
}
