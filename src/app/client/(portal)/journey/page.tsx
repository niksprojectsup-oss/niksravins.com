import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalJourneyForms } from "@/components/client/journey/FinalJourneyForms";
import { JourneyCompletionSummary } from "@/components/client/journey/JourneyCompletionSummary";
import { JourneyProgressBar } from "@/components/client/journey/JourneyProgressBar";
import { JourneyTimeline } from "@/components/client/journey/JourneyTimeline";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { PortalCard, PortalGrid } from "@/components/client/journey/PortalShell";
import { PortalPageHeader } from "@/components/client/journey/PortalPageHeader";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyPageData, getJourneyProgress } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

export default async function ClientJourneyPage() {
  const session = await requireClient();
  const [journey, progress] = await Promise.all([
    getJourneyPageData(session.clientId!),
    getJourneyProgress(session.clientId!),
  ]);
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
      <PortalPageHeader
        title="My journey"
        description="Sessions, milestones, and the arc of your transformation."
      />

      {journey.activePackage ? (
        <>
          <PortalCard padding="lg">
            <JourneyProgressBar
              timeline={journey.activePackage.timeline}
              totalSessions={journey.activePackage.totalSessions}
            />
          </PortalCard>

          <PortalGrid columns={2}>
            <PortalCard padding="lg">
              <h2 className="type-heading-sm">{journey.activePackage.serviceTitle}</h2>
              <p className="type-caption mt-2">
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
            </PortalCard>

            <PortalCard padding="lg">
              <h2 className="type-heading-sm">Milestones</h2>
              <div className="mt-6">
                <MilestoneTimeline milestones={journey.milestones} />
              </div>
            </PortalCard>
          </PortalGrid>

          {session5Complete ? (
            <>
              <JourneyCompletionSummary
                progress={progress}
                milestones={journey.milestones}
                completedSessions={journey.activePackage.completedSessions}
                totalSessions={journey.activePackage.totalSessions}
              />
              <FinalJourneyForms packageId={journey.activePackage.id} />
            </>
          ) : null}
        </>
      ) : (
        <PortalCard>
          <p className="type-body text-ink-subtle">
            Your journey timeline will appear when you begin a session package.
          </p>
          <Link href="/book" className="type-accent-link mt-4 inline-block">
            Book your first session
          </Link>
        </PortalCard>
      )}
    </div>
  );
}
