"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNav } from "@/content/admin";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle bg-canvas px-4 py-4 lg:hidden">
        <Link
          href="/admin"
          className="font-display text-lg text-ink no-underline"
        >
          {siteConfig.name}
        </Link>
        <button
          type="button"
          className="type-caption min-h-11 px-3 text-ink"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border-subtle bg-surface transform transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col px-6 py-8">
          <div className="layout-stack-sm border-b border-border-subtle pb-6">
            <Link href="/" className="font-display text-xl text-ink no-underline">
              {siteConfig.name}
            </Link>
            <p className="type-caption">Admin</p>
          </div>

          <nav aria-label="Admin" className="flex-1 py-8">
            <ul className="layout-stack-sm">
              {adminNav.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-2 type-body no-underline transition-colors duration-200",
                        isActive
                          ? "text-ink"
                          : "text-ink-subtle hover:text-ink",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <AdminLogoutButton />
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
