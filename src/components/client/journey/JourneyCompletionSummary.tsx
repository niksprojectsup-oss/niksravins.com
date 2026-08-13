import { EmotionalJourneyChart } from "@/components/client/journey/EmotionalJourneyChart";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { PortalCard, PortalGrid, PortalSectionTitle } from "@/components/client/journey/PortalShell";
import { ProgressTable } from "@/components/client/journey/ProgressTable";
import type { JourneyProgressData } from "@/lib/journey/journey-repository";
import type { JourneyMilestone } from "@/lib/journey/milestones";

type JourneyCompletionSummaryProps = {
  progress: JourneyProgressData;
  milestones: JourneyMilestone[];
  completedSessions: number;
  totalSessions: number;
};

export function JourneyCompletionSummary({
  progress,
  milestones,
  completedSessions,
  totalSessions,
}: JourneyCompletionSummaryProps) {
  const before = progress.assessments.find((a) => a.phase === "BEFORE");
  const after =
    progress.assessments.filter((a) => a.phase === "AFTER").at(-1) ??
    progress.assessments.at(-1);

  return (
    <section className="layout-stack-md">
      <PortalCard padding="lg" className="border-accent/20 bg-accent/5">
        <h2 className="type-heading-sm">Your transformation journey</h2>
        <p className="type-body mt-2 text-ink-subtle">
          A snapshot of where you started, what you moved through, and where you are now.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border-subtle bg-canvas p-4">
            <p className="type-caption">Sessions completed</p>
            <p className="type-heading-sm mt-2">
              {completedSessions} / {totalSessions}
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-canvas p-4">
            <p className="type-caption">Check-ins recorded</p>
            <p className="type-heading-sm mt-2">{progress.checkIns.length}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-canvas p-4">
            <p className="type-caption">Goals completed</p>
            <p className="type-heading-sm mt-2">
              {progress.goals.filter((g) => g.status === "COMPLETED").length}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <PortalSectionTitle title="Self-assessment shift" />
            <ProgressTable progress={progress.progressTable} />
          </div>
          <div>
            <PortalSectionTitle title="Emotional trend" />
            <EmotionalJourneyChart checkIns={progress.checkIns} />
          </div>
        </div>

        {(before || after) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {before ? (
              <div className="rounded-xl border border-border-subtle p-4">
                <p className="type-caption">Starting point</p>
                <p className="type-body mt-2">Clarity {before.clarity}/10 · Confidence {before.confidence}/10</p>
              </div>
            ) : null}
            {after ? (
              <div className="rounded-xl border border-border-subtle p-4">
                <p className="type-caption">Where you are now</p>
                <p className="type-body mt-2">Clarity {after.clarity}/10 · Confidence {after.confidence}/10</p>
              </div>
            ) : null}
          </div>
        )}

        {milestones.some((m) => m.achieved) ? (
          <div className="mt-8">
            <PortalSectionTitle title="Milestones reached" />
            <MilestoneTimeline milestones={milestones} />
          </div>
        ) : null}
      </PortalCard>
    </section>
  );
}
