import { PortalIconBadge } from "@/components/client/portal/PortalIcon";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

export default async function ClientBranchesPage() {
  await requireClient();
  const content = getPortalContent(await getPortalLocale());

  return (
    <section className="portal-card p-5 md:p-6">
      <div className="flex items-center gap-3">
        <PortalIconBadge name="tree" tone="sage" />
        <h1 className="portal-page-title text-[#2c2824]">{content.trunksPage.title}</h1>
      </div>
      <p className="mt-3 max-w-2xl text-[#6d675f]">{content.trunksPage.empty}</p>
    </section>
  );
}
