import { notFound } from "next/navigation";
import { AdminSessionReflectionsSection } from "@/components/admin/client/AdminSessionReflectionsSection";
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
import { TransformationOverviewSection } from "@/components/admin/client/TransformationOverviewSection";
import { getClientWorkspace } from "@/lib/admin/client-repository";
import {
  getAdminSharedSessionReflections,
  getAdminTransformationOverview,
} from "@/lib/journey/admin-journey-repository";

type ClientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params;
  const client = await getClientWorkspace(id);

  if (!client) {
    notFound();
  }

  const [transformationOverview, sharedReflections] = await Promise.all([
    getAdminTransformationOverview(id),
    getAdminSharedSessionReflections(id),
  ]);

  return (
    <div className="layout-stack-lg max-w-wide">
      <ClientProfileHeader client={client} />
      <ClientManagementPanel client={client} />
      <ClientOverview client={client} />
      <TransformationOverviewSection overview={transformationOverview} />
      <PackageManagementSection clientId={client.id} packages={client.packages} />
      <BookingHistorySection bookings={client.bookings} />
      <ClientSessionsSection
        upcomingSessions={client.upcomingSessions}
        completedSessions={client.completedSessions}
        clientTimezone={client.timezone}
      />
      <SessionNotesSection clientId={client.id} sessions={client.sessionNotes} />
      <AdminSessionReflectionsSection
        sessions={client.sessionNotes}
        reflections={sharedReflections}
        clientTimezone={client.timezone}
      />
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
