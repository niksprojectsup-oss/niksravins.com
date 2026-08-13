"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_DEFINITIONS,
  type Locale,
} from "@/lib/i18n/config";
import {
  getLocaleFromPathname,
  localizedPath,
  stripLocalePrefix,
} from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  label: string;
  className?: string;
};

function getCurrentPage(pathname: string): "" | "book" {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/book") return "book";
  return "";
}

export function LanguageSwitcher({ label, className }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const currentLocale = getLocaleFromPathname(pathname);
  const currentPage = getCurrentPage(pathname);

  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center gap-1", className)}>
      {LOCALES.map((locale, index) => {
        const { nativeLabel } = LOCALE_DEFINITIONS[locale];
        const href = localizedPath(locale, currentPage);
        const isActive = locale === currentLocale;

        return (
          <span key={locale} className="inline-flex items-center">
            {index > 0 ? (
              <span className="mx-1 text-ink-faint" aria-hidden>
                /
              </span>
            ) : null}
            {isActive ? (
              <span
                className="type-caption font-medium text-ink"
                aria-current="page"
                lang={LOCALE_DEFINITIONS[locale].htmlLang}
              >
                {nativeLabel}
              </span>
            ) : (
              <Link
                href={href}
                className="type-caption text-ink-subtle no-underline transition-colors hover:text-accent"
                lang={LOCALE_DEFINITIONS[locale].htmlLang}
                hrefLang={LOCALE_DEFINITIONS[locale].hreflang}
              >
                {nativeLabel}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function getSwitcherLocale(pathname: string): Locale {
  return getLocaleFromPathname(pathname);
}
