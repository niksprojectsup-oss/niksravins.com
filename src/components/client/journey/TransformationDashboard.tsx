import Link from "next/link";
import { CheckInForm } from "@/components/client/journey/CheckInForm";
import { GoalsPanel } from "@/components/client/journey/GoalsPanel";
import { JourneyTimeline } from "@/components/client/journey/JourneyTimeline";
import { NextSessionSection } from "@/components/client/journey/NextSessionSection";
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
        <h1 className="type-heading">Your transformation journey</h1>
        <p className="type-body max-w-prose text-ink-subtle">
          Your transformation journey is unfolding one step at a time.
        </p>
      </header>

      {data.activePackage ? (
        <section className="layout-stack-md">
          <h2 className="type-heading-sm">Your journey</h2>
          <div className="observed-card p-6 md:p-8">
            <p className="type-body text-ink">{data.activePackage.serviceTitle}</p>
            <div className="mt-6">
              <JourneyTimeline
                timeline={data.activePackage.timeline}
                packageId={data.activePackage.id}
                totalSessions={data.activePackage.timeline.length}
                timezone={data.timezone}
              />
            </div>
          </div>
        </section>
      ) : null}

      {data.nextSession ? (
        <NextSessionSection
          session={data.nextSession}
          preparation={data.preparation}
          timezone={data.timezone}
        />
      ) : null}

      <section className="layout-stack-md">
        <div className="flex items-center justify-between gap-4">
          <h2 className="type-heading-sm">Daily check-in</h2>
          <Link href="/client/check-in" className="type-accent-link">
            Open check-in
          </Link>
        </div>
        <CheckInForm
          timezone={data.timezone}
          existing={data.todayCheckIn}
          compact
        />
      </section>

      {data.activeGoals.length > 0 ? (
        <section className="layout-stack-md">
          <div className="flex items-center justify-between gap-4">
            <h2 className="type-heading-sm">What I&apos;m working on</h2>
            <Link href="/client/progress" className="type-accent-link">
              View all
            </Link>
          </div>
          <GoalsPanel goals={data.activeGoals} showForm={false} />
        </section>
      ) : null}

      <section className="layout-stack-md">
        <div className="flex items-center justify-between gap-4">
          <h2 className="type-heading-sm">Your progress</h2>
          <Link href="/client/progress" className="type-accent-link">
            See full progress
          </Link>
        </div>
        <ProgressTable progress={data.progressPreview} />
      </section>
    </div>
  );
}
