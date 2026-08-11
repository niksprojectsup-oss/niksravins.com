import { notFound } from "next/navigation";
import { TransformationDashboard } from "@/components/client/journey/TransformationDashboard";
import { requireClient } from "@/lib/auth/client-guards";
import { getJourneyDashboard } from "@/lib/journey/journey-repository";

export default async function ClientDashboardPage() {
  const session = await requireClient();
  const data = await getJourneyDashboard(session.clientId!);

  if (!data) {
    notFound();
  }

  return <TransformationDashboard data={data} />;
}
