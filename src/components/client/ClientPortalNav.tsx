"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/client/dashboard", label: "Home" },
  { href: "/client/journey", label: "My Journey" },
  { href: "/client/check-in", label: "Check-in" },
  { href: "/client/journal", label: "Journal" },
  { href: "/client/progress", label: "Progress" },
  { href: "/client/sessions", label: "Sessions" },
  { href: "/client/account", label: "Account" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/client/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors no-underline",
        active
          ? "bg-accent/10 text-accent"
          : "text-ink-subtle hover:bg-surface hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}

export function ClientPortalNav() {
  return (
    <nav
      aria-label="Client portal"
      className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
