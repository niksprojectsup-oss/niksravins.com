import { EmotionalJourneyChart } from "@/components/client/journey/EmotionalJourneyChart";
import { GoalsPanel } from "@/components/client/journey/GoalsPanel";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { PortalGrid, PortalSectionTitle } from "@/components/client/journey/PortalShell";
import { PortalPageHeader } from "@/components/client/journey/PortalPageHeader";
import { ProgressTable } from "@/components/client/journey/ProgressTable";
import { SelfAssessmentForm } from "@/components/client/journey/SelfAssessmentForm";
import type { JourneyProgressData } from "@/lib/journey/journey-repository";
import type { JourneyMilestone } from "@/lib/journey/milestones";

type ProgressOverviewProps = {
  progress: JourneyProgressData;
  milestones: JourneyMilestone[];
  packageId?: string | null;
  session5Complete: boolean;
};

export function ProgressOverview({
  progress,
  milestones,
  packageId,
  session5Complete,
}: ProgressOverviewProps) {
  const hasBefore = progress.assessments.some((a) => a.phase === "BEFORE");
  const completedGoals = progress.goals.filter((g) => g.status === "COMPLETED").length;

  return (
    <div className="layout-stack-xl">
      <PortalPageHeader
        title="Progress"
        description="See how your self-reflection, intentions, and emotional landscape evolve over time."
      />

      <PortalGrid columns={3}>
        <div className="rounded-xl border border-border-subtle bg-surface/40 p-5">
          <p className="type-caption">Check-ins</p>
          <p className="type-heading-sm mt-2">{progress.checkIns.length}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface/40 p-5">
          <p className="type-caption">Goals completed</p>
          <p className="type-heading-sm mt-2">{completedGoals}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface/40 p-5">
          <p className="type-caption">Assessments</p>
          <p className="type-heading-sm mt-2">{progress.assessments.length}</p>
        </div>
      </PortalGrid>

      {!hasBefore ? (
        <SelfAssessmentForm
          phase="BEFORE"
          title="Where are you right now?"
          subtitle="Before your first session, take a moment to notice where you are starting from."
          packageId={packageId}
        />
      ) : null}

      {session5Complete ? (
        <SelfAssessmentForm
          phase="AFTER"
          title="Where are you now?"
          subtitle="After your final session, notice what has shifted."
          packageId={packageId}
        />
      ) : null}

      <PortalGrid columns={2}>
        <section>
          <PortalSectionTitle title="Self-assessment" />
          <ProgressTable progress={progress.progressTable} />
        </section>
        <section>
          <PortalSectionTitle title="Emotional trend" />
          <EmotionalJourneyChart checkIns={progress.checkIns} />
        </section>
      </PortalGrid>

      <PortalGrid columns={2}>
        <GoalsPanel goals={progress.goals} />
        <section>
          <PortalSectionTitle title="Milestones" />
          <div className="observed-card p-6 md:p-8">
            {milestones.some((m) => m.achieved) ? (
              <MilestoneTimeline milestones={milestones} />
            ) : (
              <p className="type-body text-ink-subtle">
                Milestones will appear as your journey unfolds.
              </p>
            )}
          </div>
        </section>
      </PortalGrid>
    </div>
  );
}
