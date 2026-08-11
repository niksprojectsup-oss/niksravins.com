import { JournalPanel } from "@/components/client/journey/JournalPanel";
import { requireClient } from "@/lib/auth/client-guards";
import { listJournalEntries } from "@/lib/journey/journey-repository";

export default async function ClientJournalPage() {
  const session = await requireClient();
  const entries = await listJournalEntries(session.clientId!);

  return (
    <div className="layout-stack-xl">
      <header className="layout-stack-sm">
        <h1 className="type-heading">Journal</h1>
        <p className="type-body text-ink-subtle">
          A private space for reflection — you choose what to share.
        </p>
      </header>
      <JournalPanel entries={entries} />
    </div>
  );
}
