import { notFound } from "next/navigation";
import { ClientDashboardView } from "@/components/client/ClientDashboardView";
import { requireClient } from "@/lib/auth/client-guards";
import { getClientPortalDashboard } from "@/lib/client/portal-repository";
import { prisma } from "@/lib/db/prisma";

export default async function ClientDashboardPage() {
  const session = await requireClient();
  const dashboard = await getClientPortalDashboard(session.clientId!);

  if (!dashboard) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: { timezone: true },
  });

  return (
    <ClientDashboardView
      dashboard={dashboard}
      timezone={client?.timezone ?? "Europe/Riga"}
    />
  );
}
