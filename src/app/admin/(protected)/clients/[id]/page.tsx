import { notFound } from "next/navigation";
import { ClientOverview, ClientProfileHeader } from "@/components/admin/client/ClientOverview";
import { PractitionerNotesSection } from "@/components/admin/client/PractitionerNotesSection";
import { ProgressTrackingSection } from "@/components/admin/client/ProgressTrackingSection";
import { ReactionAnalysisSection } from "@/components/admin/client/ReactionAnalysisSection";
import { SessionNotesSection } from "@/components/admin/client/SessionNotesSection";
import { getClientWorkspace } from "@/lib/admin/client-repository";

type ClientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params;
  const client = await getClientWorkspace(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="layout-stack-lg max-w-wide">
      <ClientProfileHeader client={client} />
      <ClientOverview client={client} />
      <ReactionAnalysisSection
        clientId={client.id}
        initialData={client.reactionAnalysis}
      />
      <ProgressTrackingSection clientId={client.id} checklist={client.checklist} />
      <SessionNotesSection clientId={client.id} sessions={client.sessionNotes} />
      <PractitionerNotesSection
        clientId={client.id}
        initialNotes={client.practitionerNotes}
      />
    </div>
  );
}
