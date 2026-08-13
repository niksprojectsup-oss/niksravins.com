import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  type Locale,
  type LocalizedPublicPage,
} from "@/lib/i18n/config";
import {
  getPublishedLocalesForPage,
  localizedPath,
} from "@/lib/i18n/paths";
import { getAppBaseUrl } from "@/lib/url";

export function absoluteUrl(path: string): string {
  const base = getAppBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`.replace(/\/$/, "") || base;
}

export function buildLanguageAlternates(
  page: LocalizedPublicPage,
): Record<string, string> {
  const locales = getPublishedLocalesForPage(page);
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    const { hreflang } = LOCALE_DEFINITIONS[locale];
    languages[hreflang] = absoluteUrl(localizedPath(locale, page));
  }

  if (locales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, page));
  }

  return languages;
}

type PublicMetadataInput = {
  locale: Locale;
  page: LocalizedPublicPage;
  title: string;
  description: string;
};

export function buildPublicMetadata({
  locale,
  page,
  title,
  description,
}: PublicMetadataInput): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, page));
  const languages = buildLanguageAlternates(page);
  const { htmlLang } = LOCALE_DEFINITIONS[locale];

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: htmlLang,
      siteName: "Niks Ravins",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildPrivateMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}
