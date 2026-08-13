import { ProgressOverview } from "@/components/client/journey/ProgressOverview";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyProgress, getJourneyPageData } from "@/lib/journey/journey-repository";

export default async function ClientProgressPage() {
  const session = await requireClient();
  const [progress, journey] = await Promise.all([
    getJourneyProgress(session.clientId!),
    getJourneyPageData(session.clientId!),
  ]);

  const session5Complete = journey.activePackage?.timeline.some(
    (s) => s.sessionNumber === 5 && s.status === "completed",
  );

  return (
    <ProgressOverview
      progress={progress}
      milestones={journey.milestones}
      packageId={journey.activePackage?.id}
      session5Complete={Boolean(session5Complete)}
    />
  );
}
