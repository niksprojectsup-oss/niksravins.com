import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalJourneyForms } from "@/components/client/journey/FinalJourneyForms";
import { JourneyCompletionSummary } from "@/components/client/journey/JourneyCompletionSummary";
import { JourneyProgressBar } from "@/components/client/journey/JourneyProgressBar";
import { JourneyTimeline } from "@/components/client/journey/JourneyTimeline";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { PortalCard, PortalGrid } from "@/components/client/journey/PortalShell";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { getJourneyPageData, getJourneyProgress } from "@/lib/journey/journey-repository";
import { prisma } from "@/lib/db/prisma";

export default async function ClientJourneyPage() {
  const session = await requireClient();
  const content = getPortalContent(await getPortalLocale());
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
    <div className="portal-stack">
      <header className="layout-stack-sm">
        <h1 className="portal-page-title text-[#2c2824]">{content.journeyPage.title}</h1>
        <p className="max-w-2xl text-[#6d675f]">{content.journeyPage.description}</p>
      </header>

      {journey.activePackage ? (
        <>
          <PortalCard padding="lg">
            <JourneyProgressBar
              timeline={journey.activePackage.timeline}
              totalSessions={journey.activePackage.totalSessions}
              progressLabel={content.journeyPage.sessionProgress}
              completedLabel={content.journeyPage.completed}
            />
          </PortalCard>

          <PortalGrid columns={2}>
            <PortalCard padding="lg">
              <h2 className="type-heading-sm">{journey.activePackage.serviceTitle}</h2>
              <p className="type-caption mt-2">
                {journey.activePackage.completedSessions} {content.journeyPage.completed} ·{" "}
                {journey.activePackage.remainingSessions} {content.journeyPage.remaining}
              </p>
              <div className="mt-6">
                <JourneyTimeline
                  timeline={journey.activePackage.timeline}
                  packageId={journey.activePackage.id}
                  totalSessions={journey.activePackage.totalSessions}
                  timezone={timezone}
                  copy={content.journeyPage}
                  prepareLabel={content.sessionsPage.prepare}
                  bookLabel={content.sessionsPage.book}
                />
              </div>
            </PortalCard>

            <PortalCard padding="lg">
              <h2 className="type-heading-sm">{content.journeyPage.milestones}</h2>
              <div className="mt-6">
                <MilestoneTimeline
                  milestones={journey.milestones}
                  labels={content.journeyPage.milestoneLabels}
                />
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
                milestoneLabels={content.journeyPage.milestoneLabels}
              />
              <FinalJourneyForms packageId={journey.activePackage.id} />
            </>
          ) : null}
        </>
      ) : (
        <PortalCard>
          <p className="type-body text-ink-subtle">{content.journeyPage.empty}</p>
          <Link href="/book" className="type-accent-link mt-4 inline-block">
            {content.journeyPage.book}
          </Link>
        </PortalCard>
      )}
    </div>
  );
}
