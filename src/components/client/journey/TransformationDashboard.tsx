import Link from "next/link";
import { CheckInForm } from "@/components/client/journey/CheckInForm";
import { GoalsPanel } from "@/components/client/journey/GoalsPanel";
import { JourneyProgressBar } from "@/components/client/journey/JourneyProgressBar";
import { NextSessionSection } from "@/components/client/journey/NextSessionSection";
import { PortalCard, PortalGrid, PortalSectionTitle } from "@/components/client/journey/PortalShell";
import { ProgressTable } from "@/components/client/journey/ProgressTable";
import type { JourneyDashboardData } from "@/lib/journey/journey-repository";

type TransformationDashboardProps = {
  data: JourneyDashboardData;
};

export function TransformationDashboard({ data }: TransformationDashboardProps) {
  return (
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <p className="type-caption text-accent">Welcome back, {data.firstName}</p>
        <h1 className="type-heading">Your Transformation Journey</h1>
        <p className="type-body max-w-2xl text-ink-subtle">
          A personal space to reflect, prepare, and notice what&apos;s shifting between sessions.
        </p>
      </header>

      {data.activePackage ? (
        <PortalCard padding="lg">
          <PortalSectionTitle title={data.activePackage.serviceTitle} />
          <JourneyProgressBar
            timeline={data.activePackage.timeline}
            totalSessions={data.activePackage.timeline.length}
          />
        </PortalCard>
      ) : null}

      <PortalGrid columns={data.nextSession ? 2 : 1}>
        {data.nextSession ? (
          <NextSessionSection
            session={data.nextSession}
            preparation={data.preparation}
            timezone={data.timezone}
          />
        ) : null}

        <PortalCard>
          <PortalSectionTitle
            title="How are you feeling today?"
            action={
              <Link href="/client/check-in" className="type-accent-link text-sm">
                Full check-in
              </Link>
            }
          />
          <CheckInForm
            timezone={data.timezone}
            existing={data.todayCheckIn}
            compact
            inline
          />
        </PortalCard>
      </PortalGrid>

      <PortalGrid columns={2}>
        <div className="layout-stack-md">
          <PortalSectionTitle
            title="What I'm working on"
            action={
              data.activeGoals.length > 0 ? (
                <Link href="/client/progress" className="type-accent-link text-sm">
                  View all
                </Link>
              ) : null
            }
          />
          {data.activeGoals.length > 0 ? (
            <GoalsPanel goals={data.activeGoals} showForm={false} compact />
          ) : (
            <PortalCard>
              <p className="type-body text-ink-subtle">
                What would you like to transform?{" "}
                <Link href="/client/progress" className="type-accent-link">
                  Set an intention
                </Link>
              </p>
            </PortalCard>
          )}
        </div>

        <div className="layout-stack-md">
          <PortalSectionTitle
            title="Your progress"
            action={
              <Link href="/client/progress" className="type-accent-link text-sm">
                See full progress
              </Link>
            }
          />
          <ProgressTable progress={data.progressPreview} compact />
        </div>
      </PortalGrid>
    </div>
  );
}
