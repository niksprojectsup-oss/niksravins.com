"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation, siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      <div className="layout-container flex min-h-[4.5rem] items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-lg tracking-snug text-ink no-underline hover:text-accent"
        >
          {siteConfig.name}
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-10 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="type-caption text-ink-subtle no-underline transition-colors duration-300 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/book"
            className="type-caption font-medium text-accent no-underline transition-colors duration-300 hover:text-accent-strong"
          >
            Book
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-ink md:hidden"
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

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={cn(
          "border-t border-border-subtle bg-canvas md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <ul className="layout-container flex flex-col py-6">
          {navigation.map((item) => (
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
          <li className="pt-4">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center text-accent no-underline"
              onClick={() => setMenuOpen(false)}
            >
              Book a Session
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
