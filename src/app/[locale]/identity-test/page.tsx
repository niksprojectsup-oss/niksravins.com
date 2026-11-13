import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import { PublicIdentityTestPage } from "@/components/public/PublicIdentityTestPage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { getPublicTestContent, loadConsentText } from "@/lib/identity-test/repository";
import { isBetaRequestAllowed } from "@/lib/identity-test/beta";
import { IdentityTestClosedNotice } from "@/components/public/IdentityTestClosedNotice";
import { localizedPath } from "@/lib/i18n/paths";

export const dynamic = "force-dynamic";

// Pagaidām publicēts tikai LV/EN (satura apstiprināšanas process).
const ENABLED_LOCALES = ["lv", "en"] as const;

type LocaleIdentityTestPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleIdentityTestPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = await getResolvedPublicContent(locale);
  return {
    ...buildPublicMetadata({
      locale,
      page: "identity-test",
      title: content.identityTest.seo.title,
      description: content.identityTest.seo.description,
    }),
    robots: { index: true, follow: true },
  };
}

export default async function LocaleIdentityTestPage({ params }: LocaleIdentityTestPageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale || !(ENABLED_LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  const [content, tree, consentText] = await Promise.all([
    getResolvedPublicContent(locale),
    getPublicTestContent(locale),
    loadConsentText(locale),
  ]);

  if (tree.themes.length === 0) {
    notFound();
  }

  if (!(await isBetaRequestAllowed())) {
    return <IdentityTestClosedNotice content={content} locale={locale} />;
  }

  return (
    <PublicIdentityTestPage
      content={content}
      locale={locale}
      tree={tree}
      consentLabel={consentText?.value ?? ""}
      bookingUrl={localizedPath(locale, "book")}
    />
  );
}
