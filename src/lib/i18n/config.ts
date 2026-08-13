export const DEFAULT_LOCALE = "en" as const;

export const LOCALES = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "ja",
  "zh",
] as const;

export type Locale = (typeof LOCALES)[number];

export type LocaleDefinition = {
  locale: Locale;
  hreflang: string;
  htmlLang: string;
  label: string;
  nativeLabel: string;
};

export const LOCALE_DEFINITIONS: Record<Locale, LocaleDefinition> = {
  en: {
    locale: "en",
    hreflang: "en",
    htmlLang: "en",
    label: "English",
    nativeLabel: "EN",
  },
  de: {
    locale: "de",
    hreflang: "de",
    htmlLang: "de",
    label: "German",
    nativeLabel: "DE",
  },
  fr: {
    locale: "fr",
    hreflang: "fr",
    htmlLang: "fr",
    label: "French",
    nativeLabel: "FR",
  },
  es: {
    locale: "es",
    hreflang: "es",
    htmlLang: "es",
    label: "Spanish",
    nativeLabel: "ES",
  },
  it: {
    locale: "it",
    hreflang: "it",
    htmlLang: "it",
    label: "Italian",
    nativeLabel: "IT",
  },
  ja: {
    locale: "ja",
    hreflang: "ja",
    htmlLang: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
  },
  zh: {
    locale: "zh",
    hreflang: "zh-Hans",
    htmlLang: "zh-Hans",
    label: "Chinese (Simplified)",
    nativeLabel: "中文",
  },
};

/** Public pages that have localized SEO URLs. */
export const LOCALIZED_PUBLIC_PAGES = ["", "book"] as const;

export type LocalizedPublicPage = (typeof LOCALIZED_PUBLIC_PAGES)[number];

export const PUBLISHED_LOCALES: Locale[] = [...LOCALES];
