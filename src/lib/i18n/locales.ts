import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
} from "./config";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function parseLocaleParam(value: string | undefined): Locale | null {
  if (!value || !isLocale(value) || value === DEFAULT_LOCALE) {
    return null;
  }
  return value;
}

export function getHtmlLang(locale: Locale): string {
  if (locale === "zh") return "zh-Hans";
  return locale;
}
