"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { PortalContent } from "@/content/i18n/portal";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { PortalLanguageSwitcher } from "./PortalLanguageSwitcher";

const LINKS = [
  ["home", "/client/dashboard"],
  ["path", "/client/journey"],
  ["sessions", "/client/sessions"],
  ["insights", "/client/journal"],
  ["account", "/client/account"],
] as const;

type PortalHeaderProps = {
  content: PortalContent;
  locale: Locale;
};

export function PortalHeader({ content, locale }: PortalHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#eadfd2] bg-[#f7f1e8]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:px-8">
        <Link
          href="/client/dashboard"
          className="font-display text-sm tracking-[0.22em] text-[#3f3a34] no-underline"
        >
          NIKS RAVINS
        </Link>

        <nav aria-label={content.nav.label} className="ml-auto hidden items-center gap-6 md:flex">
          {LINKS.map(([key, href]) => {
            const active = pathname === href || (href !== "/client/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm no-underline",
                  active ? "text-[#2f2b26] underline decoration-[#c4b49a] underline-offset-8" : "text-[#6d675f] hover:text-[#2f2b26]",
                )}
              >
                {content.nav[key]}
              </Link>
            );
          })}
        </nav>

        <form action="/client/journal" className="ml-auto hidden md:ml-4 md:block">
          <label className="sr-only" htmlFor="portal-search">
            {content.nav.search}
          </label>
          <input
            id="portal-search"
            name="q"
            type="search"
            placeholder={content.insights.searchPlaceholder}
            className="h-9 w-40 rounded-full border border-[#e4d8c8] bg-white/70 px-3 text-sm text-[#3f3a34] placeholder:text-[#a3988c]"
          />
        </form>

        <PortalLanguageSwitcher locale={locale} label={content.languageSwitcherLabel} />

        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full border border-[#e4d8c8] px-3 text-sm text-[#5c564e] md:hidden"
          aria-expanded={open}
          aria-controls="portal-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? content.nav.closeMenu : content.nav.openMenu}
        </button>
      </div>

      {open ? (
        <nav id="portal-mobile-nav" aria-label={content.nav.label} className="border-t border-[#eadfd2] px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-2">
            {LINKS.map(([key, href]) => (
              <li key={href}>
                <Link href={href} className="block py-1 text-[#3f3a34] no-underline" onClick={() => setOpen(false)}>
                  {content.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
          <form action="/client/journal" className="mt-3">
            <label className="sr-only" htmlFor="portal-search-mobile">
              {content.nav.search}
            </label>
            <input
              id="portal-search-mobile"
              name="q"
              type="search"
              placeholder={content.insights.searchPlaceholder}
              className="h-10 w-full rounded-full border border-[#e4d8c8] bg-white px-3 text-sm"
            />
          </form>
        </nav>
      ) : null}
    </header>
  );
}
