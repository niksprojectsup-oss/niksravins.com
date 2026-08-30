import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/content/i18n";
import { PublicBookPage } from "@/components/public/PublicBookPage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import {
  ensureDefaultOffersSeeded,
  getBookableServices,
} from "@/lib/booking/services-catalog";

export const dynamic = "force-dynamic";

type LocaleBookPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleBookPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = getPublicContent(locale);
  return buildPublicMetadata({
    locale,
    page: "book",
    title: content.seo.book.title,
    description: content.seo.book.description,
  });
}

export default async function LocaleBookPage({ params }: LocaleBookPageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  const content = getPublicContent(locale);
  await ensureDefaultOffersSeeded();
  const offers = await getBookableServices();

  return <PublicBookPage content={content} locale={locale} offers={offers} />;
}
