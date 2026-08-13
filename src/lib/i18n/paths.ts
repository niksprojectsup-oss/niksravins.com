import {
  DEFAULT_LOCALE,
  LOCALIZED_PUBLIC_PAGES,
  PUBLISHED_LOCALES,
  type Locale,
  type LocalizedPublicPage,
} from "./config";
import { isLocale } from "./locales";

export function stripLocalePrefix(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0]) && segments[0] !== DEFAULT_LOCALE) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return normalized === "" ? "/" : normalized;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first) && first !== DEFAULT_LOCALE) {
    return first;
  }
  return DEFAULT_LOCALE;
}

export function localizedPath(
  locale: Locale,
  page: LocalizedPublicPage = "",
): string {
  const suffix = page ? `/${page}` : "";
  if (locale === DEFAULT_LOCALE) {
    return suffix || "/";
  }
  return `/${locale}${suffix}`;
}

export function isLocalizedPublicPage(path: string): path is `/${LocalizedPublicPage}` | "/" {
  const normalized = stripLocalePrefix(path);
  if (normalized === "/") return true;
  const page = normalized.slice(1);
  return (LOCALIZED_PUBLIC_PAGES as readonly string[]).includes(page);
}

export function getPublishedLocalesForPage(page: LocalizedPublicPage): Locale[] {
  return PUBLISHED_LOCALES.filter((locale) => localeHasPage(locale, page));
}

export function localeHasPage(_locale: Locale, _page: LocalizedPublicPage): boolean {
  return PUBLISHED_LOCALES.includes(_locale);
}
