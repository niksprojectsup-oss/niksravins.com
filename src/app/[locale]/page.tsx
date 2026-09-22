import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHomePage } from "@/components/public/PublicHomePage";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { getPublicHomeContent, getPublicHomeMetadata } from "@/lib/cms/public-content";

export const dynamic = "force-dynamic";

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleHomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);
  if (!locale) return {};

  const content = await getPublicHomeMetadata(locale);
  return {
    ...buildPublicMetadata({
      locale,
      page: "",
      title: content.title,
      description: content.description,
    }),
    title: {
      absolute: content.title,
    },
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  const { content, cmsHtmlFields } = await getPublicHomeContent(locale);

  return <PublicHomePage content={content} locale={locale} cmsHtmlFields={cmsHtmlFields} />;
}
