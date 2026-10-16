import { PortalFooter } from "@/components/client/portal/PortalFooter";
import { PortalHeader } from "@/components/client/portal/PortalHeader";
import { getPortalContent, portalIntlLocale } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";

export const dynamic = "force-dynamic";

export default async function ClientPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireClient();
  const locale = await getPortalLocale();
  const content = getPortalContent(locale);

  return (
    <div lang={portalIntlLocale(locale)} className="min-h-screen bg-[#f6f1e8] text-[#2c2824]">
      <PortalHeader content={content} locale={locale} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      <PortalFooter content={content} locale={locale} />
    </div>
  );
}
