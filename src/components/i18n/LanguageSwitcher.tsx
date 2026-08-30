"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LOCALE_DEFINITIONS[currentLocale];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        id="language-switcher-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border-subtle bg-surface/80 px-3 py-2 text-sm text-ink-subtle transition-colors hover:border-border-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span lang={current.htmlLang}>{current.nativeLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-labelledby="language-switcher-button"
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-md border border-border-subtle bg-surface py-1 shadow-elevated"
        >
          {LOCALES.map((locale) => {
            const definition = LOCALE_DEFINITIONS[locale];
            const href = localizedPath(locale, currentPage);
            const isActive = locale === currentLocale;

            return (
              <li key={locale} role="option" aria-selected={isActive}>
                {isActive ? (
                  <span
                    className="block px-3 py-2 text-sm font-medium text-ink"
                    lang={definition.htmlLang}
                  >
                    {definition.label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="block px-3 py-2 text-sm text-ink-subtle no-underline transition-colors hover:bg-accent-soft hover:text-ink"
                    lang={definition.htmlLang}
                    hrefLang={definition.hreflang}
                    onClick={() => setOpen(false)}
                  >
                    {definition.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function getSwitcherLocale(pathname: string): Locale {
  return getLocaleFromPathname(pathname);
}
