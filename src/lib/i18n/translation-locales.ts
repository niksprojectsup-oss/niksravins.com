import { LOCALES, type Locale } from "@/lib/i18n/config";

export const TRANSLATION_LOCALES = ["en", "lv", "de", "fr", "es", "it", "ja", "zh"] as const;

export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export const TRANSLATION_PAGES = ["shared", "home", "book", "legal"] as const;

export type TranslationPage = (typeof TRANSLATION_PAGES)[number];

export const TRANSLATION_LOCALE_LABELS: Record<TranslationLocale, string> = {
  en: "English",
  lv: "Latvian",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  ja: "Japanese",
  zh: "Chinese",
};

export function isTranslationLocale(value: string): value is TranslationLocale {
  return (TRANSLATION_LOCALES as readonly string[]).includes(value);
}

export function isPublicTranslationLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function assertTranslationLocale(value: string): TranslationLocale {
  if (!isTranslationLocale(value)) {
    throw new Error("Unsupported translation locale.");
  }
  return value;
}
