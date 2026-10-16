import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

export default async function ClientBranchesPage() {
  await requireClient();
  const content = getPortalContent(await getPortalLocale());

  return (
    <section className="rounded-[2rem] border border-[#eadfd2] bg-white p-6 md:p-8">
      <h1 className="font-display text-3xl text-[#2c2824]">{content.trunksPage.title}</h1>
      <p className="mt-3 max-w-2xl text-[#6d675f]">{content.trunksPage.empty}</p>
    </section>
  );
}
