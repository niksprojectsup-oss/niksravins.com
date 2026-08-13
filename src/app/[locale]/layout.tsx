import { notFound } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALES,
} from "@/lib/i18n/config";
import { parseLocaleParam } from "@/lib/i18n/locales";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = parseLocaleParam(localeParam);

  if (!locale) {
    notFound();
  }

  return children;
}
