import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/locales";

export function parsePortalLocale(value: string | undefined | null): Locale {
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}
