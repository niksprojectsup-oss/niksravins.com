import { EmotionalJourneyChart } from "@/components/client/journey/EmotionalJourneyChart";
import { GoalsPanel } from "@/components/client/journey/GoalsPanel";
import { ProgressTable } from "@/components/client/journey/ProgressTable";
import { SelfAssessmentForm } from "@/components/client/journey/SelfAssessmentForm";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyProgress, getJourneyPageData } from "@/lib/journey/journey-repository";

export default async function ClientProgressPage() {
  const session = await requireClient();
  const [progress, journey] = await Promise.all([
    getJourneyProgress(session.clientId!),
    getJourneyPageData(session.clientId!),
  ]);

  const hasBefore = progress.assessments.some((a) => a.phase === "BEFORE");
  const session5Complete = journey.activePackage?.timeline.some(
    (s) => s.sessionNumber === 5 && s.status === "completed",
  );

  return (
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <h1 className="type-heading">Progress</h1>
        <p className="type-body text-ink-subtle">
          Self-assessment, intentions, and your reflection over time.
        </p>
      </header>

      {!hasBefore ? (
        <SelfAssessmentForm
          phase="BEFORE"
          title="Where are you right now?"
          subtitle="Before your first session, take a moment to notice where you are starting from."
          packageId={journey.activePackage?.id}
        />
      ) : null}

      {session5Complete ? (
        <SelfAssessmentForm
          phase="AFTER"
          title="Where are you now?"
          subtitle="After your final session, notice what has shifted."
          packageId={journey.activePackage?.id}
        />
      ) : null}

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">Your progress</h2>
        <ProgressTable progress={progress.progressTable} />
      </section>

      <GoalsPanel goals={progress.goals} />

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">Emotional journey</h2>
        <EmotionalJourneyChart checkIns={progress.checkIns} />
      </section>
    </div>
  );
}
