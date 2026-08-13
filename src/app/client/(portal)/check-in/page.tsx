import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/client/journey/CheckInForm";
import { PortalCard } from "@/components/client/journey/PortalShell";
import { PortalPageHeader } from "@/components/client/journey/PortalPageHeader";
import { requireClient } from "@/lib/auth/client-guards";
import { getTodayCheckIn } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

export default async function ClientCheckInPage() {
  const session = await requireClient();
  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: { timezone: true },
  });
  if (!client) notFound();

  const todayCheckIn = await getTodayCheckIn(session.clientId!, client.timezone);

  return (
    <div className="layout-stack-xl max-w-3xl">
      <PortalPageHeader
        title="Check-in"
        description="A gentle moment to notice how you are today."
      />
      <PortalCard padding="lg">
        <CheckInForm timezone={client.timezone} existing={todayCheckIn} />
      </PortalCard>
    </div>
  );
}
