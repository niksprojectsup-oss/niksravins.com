import { notFound } from "next/navigation";
import { PortalHome } from "@/components/client/portal/PortalHome";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { getPortalHome } from "@/lib/journey/journey-repository";

type ClientDashboardPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ClientDashboardPage({ searchParams }: ClientDashboardPageProps) {
  const session = await requireClient();
  const locale = await getPortalLocale();
  const params = await searchParams;
  const data = await getPortalHome(session.clientId!);

  if (!data) {
    notFound();
  }

  return (
    <PortalHome
      data={data}
      content={getPortalContent(locale)}
      locale={locale}
      initialQuery={params.q}
      asOf={new Date().toISOString()}
    />
  );
}
