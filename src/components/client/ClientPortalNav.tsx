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

function NavLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "mobile" | "sidebar";
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/client/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "no-underline transition-colors",
        variant === "mobile"
          ? cn(
              "whitespace-nowrap rounded-full px-3 py-2 text-sm",
              active
                ? "bg-accent/10 text-accent"
                : "text-ink-subtle hover:bg-surface hover:text-ink",
            )
          : cn(
              "block rounded-lg px-3 py-2.5 text-sm",
              active
                ? "bg-accent/10 font-medium text-accent"
                : "text-ink-subtle hover:bg-surface hover:text-ink",
            ),
      )}
    >
      {label}
    </Link>
  );
}

export function ClientPortalNav({ variant = "mobile" }: { variant?: "mobile" | "sidebar" }) {
  return (
    <nav
      aria-label="Client portal"
      className={cn(
        variant === "mobile"
          ? "-mx-1 flex gap-1 overflow-x-auto pb-1 lg:hidden"
          : "hidden lg:flex lg:flex-col lg:gap-1",
      )}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} variant={variant} />
      ))}
    </nav>
  );
}
