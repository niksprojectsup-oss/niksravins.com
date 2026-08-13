import { JournalPanel } from "@/components/client/journey/JournalPanel";
import { PortalPageHeader } from "@/components/client/journey/PortalPageHeader";
import { requireClient } from "@/lib/auth/client-guards";
import { listJournalEntries } from "@/lib/journey/journey-repository";

export default async function ClientJournalPage() {
  const session = await requireClient();
  const entries = await listJournalEntries(session.clientId!);

  return (
    <div className="layout-stack-xl">
      <PortalPageHeader
        title="Journal"
        description="A private space for reflection — you choose what to share."
      />
      <JournalPanel entries={entries} />
    </div>
  );
}
