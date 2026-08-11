import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalJourneyForms } from "@/components/client/journey/FinalJourneyForms";
import { JourneyTimeline } from "@/components/client/journey/JourneyTimeline";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyPageData } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

export default async function ClientJourneyPage() {
  const session = await requireClient();
  const journey = await getJourneyPageData(session.clientId!);
  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: { timezone: true },
  });

  if (!client) notFound();

  const timezone = client.timezone;
  const session5Complete = journey.activePackage?.timeline.some(
    (s) => s.sessionNumber === 5 && s.status === "completed",
  );

  return (
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <h1 className="type-heading">My journey</h1>
        <p className="type-body text-ink-subtle">
          Sessions, milestones, and the arc of your transformation.
        </p>
      </header>

      {journey.activePackage ? (
        <>
          <section className="layout-stack-md">
            <h2 className="type-heading-sm">{journey.activePackage.serviceTitle}</h2>
            <div className="observed-card p-6 md:p-8">
              <p className="type-caption">
                {journey.activePackage.completedSessions} completed ·{" "}
                {journey.activePackage.remainingSessions} remaining
              </p>
              <div className="mt-6">
                <JourneyTimeline
                  timeline={journey.activePackage.timeline}
                  packageId={journey.activePackage.id}
                  totalSessions={journey.activePackage.totalSessions}
                  timezone={timezone}
                />
              </div>
            </div>
          </section>

          <section className="layout-stack-md">
            <h2 className="type-heading-sm">Milestones</h2>
            <div className="observed-card p-6 md:p-8">
              <MilestoneTimeline milestones={journey.milestones} />
            </div>
          </section>

          {session5Complete ? (
            <FinalJourneyForms packageId={journey.activePackage.id} />
          ) : null}
        </>
      ) : (
        <div className="observed-card p-6 md:p-8">
          <p className="type-body text-ink-subtle">
            Your journey timeline will appear when you begin a session package.
          </p>
          <Link href="/book" className="type-accent-link mt-4 inline-block">
            Book your first session
          </Link>
        </div>
      )}
    </div>
  );
}
