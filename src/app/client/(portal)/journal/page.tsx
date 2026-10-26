import { JournalPanel } from "@/components/client/journey/JournalPanel";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { listJournalEntries } from "@/lib/journey/journey-repository";

type ClientJournalPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClientJournalPage({ searchParams }: ClientJournalPageProps) {
  const session = await requireClient();
  const locale = await getPortalLocale();
  const params = await searchParams;
  const content = getPortalContent(locale);
  const entries = await listJournalEntries(session.clientId!);

  return (
    <JournalPanel
      entries={entries}
      copy={content.insights}
      locale={locale}
      initialQuery={params.q ?? ""}
    />
  );
}
