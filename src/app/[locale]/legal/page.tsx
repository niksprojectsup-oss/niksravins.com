import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import { PublicStandaloneCmsPage } from "@/components/public/PublicStandaloneCmsPage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type LocaleLegalPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleLegalPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = await getResolvedPublicContent(locale);
  return buildPublicMetadata({
    locale,
    page: "legal",
    title: content.seo.legal.title,
    description: content.seo.legal.description,
  });
}

export default async function LocaleLegalPage({ params }: LocaleLegalPageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  return <PublicStandaloneCmsPage slug="legal" locale={locale} />;
}
