import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/client/journey/CheckInForm";
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
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <h1 className="type-heading">Check-in</h1>
        <p className="type-body text-ink-subtle">
          A gentle moment to notice how you are today.
        </p>
      </header>
      <CheckInForm timezone={client.timezone} existing={todayCheckIn} />
    </div>
  );
}
