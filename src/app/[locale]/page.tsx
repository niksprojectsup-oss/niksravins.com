import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/content/i18n";
import { PublicHomePage } from "@/components/public/PublicHomePage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleHomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = getPublicContent(locale);
  return {
    ...buildPublicMetadata({
      locale,
      page: "",
      title: content.seo.home.title,
      description: content.seo.home.description,
    }),
    title: {
      absolute: content.seo.home.title,
    },
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  const content = getPublicContent(locale);

  return <PublicHomePage content={content} locale={locale} />;
}
