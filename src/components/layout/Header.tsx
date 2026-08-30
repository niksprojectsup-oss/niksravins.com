"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";

type HeaderProps = {
  content: PublicContent;
  locale: Locale;
};

const navLinkClass =
  "type-caption text-ink-subtle no-underline transition-colors duration-300 hover:text-ink";

export function Header({ content, locale }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const homePath = localizedPath(locale, "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-border-subtle bg-canvas/90 backdrop-blur-sm"
          : "bg-transparent",
      )}
    >
      <div className="layout-container flex min-h-[4.5rem] items-center justify-between gap-4 py-4 lg:gap-6">
        <Link
          href={homePath}
          className="shrink-0 font-display text-lg tracking-snug text-ink no-underline hover:text-accent"
        >
          {content.site.name}
        </Link>

        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex"
        >
          {content.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
          <Link
            href={content.site.bookingUrl}
            className="type-caption font-medium text-accent no-underline transition-colors duration-300 hover:text-accent-strong"
          >
            {content.header.book}
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageSwitcher label={content.languageSwitcherLabel} />
          <Link href="/client/login" className={navLinkClass}>
            {content.header.clientPortal}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link href="/client/login" className={navLinkClass}>
            {content.header.clientPortal}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-ink"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              aria-hidden
              className="text-current"
            >
              {menuOpen ? (
                <>
                  <path
                    d="M2 2L16 12"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M0 1H18"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 7H18"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 13H18"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={cn(
          "border-t border-border-subtle bg-canvas lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <ul className="layout-container flex flex-col py-6">
          {content.navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block py-4 font-display text-2xl text-ink no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={content.site.bookingUrl}
              className="block py-4 font-display text-2xl text-accent no-underline"
              onClick={() => setMenuOpen(false)}
            >
              {content.header.book}
            </Link>
          </li>
          <li className="pt-6">
            <LanguageSwitcher label={content.languageSwitcherLabel} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
