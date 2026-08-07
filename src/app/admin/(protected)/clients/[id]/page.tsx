import { notFound } from "next/navigation";
import { PackageManagementSection } from "@/components/admin/client/PackageManagementSection";
import { BookingHistorySection } from "@/components/admin/client/BookingHistorySection";
import { ClientManagementPanel } from "@/components/admin/client/ClientManagementPanel";
import { ClientOverview, ClientProfileHeader } from "@/components/admin/client/ClientOverview";
import { ClientTimelineSection } from "@/components/admin/client/ClientTimelineSection";
import { PractitionerNotesSection } from "@/components/admin/client/PractitionerNotesSection";
import { ProgressTrackingSection } from "@/components/admin/client/ProgressTrackingSection";
import { ReactionAnalysisSection } from "@/components/admin/client/ReactionAnalysisSection";
import { ClientSessionsSection } from "@/components/admin/client/ClientSessionsSection";
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
      <ClientManagementPanel client={client} />
      <ClientOverview client={client} />
      <PackageManagementSection clientId={client.id} packages={client.packages} />
      <BookingHistorySection bookings={client.bookings} />
      <ClientSessionsSection
        upcomingSessions={client.upcomingSessions}
        completedSessions={client.completedSessions}
        clientTimezone={client.timezone}
      />
      <SessionNotesSection clientId={client.id} sessions={client.sessionNotes} />
      <ProgressTrackingSection clientId={client.id} checklist={client.checklist} />
      <ReactionAnalysisSection
        clientId={client.id}
        initialData={client.reactionAnalysis}
      />
      <PractitionerNotesSection
        clientId={client.id}
        initialNotes={client.practitionerNotes}
      />
      <ClientTimelineSection events={client.timeline} />
    </div>
  );
}
