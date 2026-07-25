import Link from "next/link";
import { navigation, siteConfig } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle">
      <div className="layout-container layout-section-sm">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="layout-stack-sm max-w-prose">
            <p className="font-display text-xl text-ink">{siteConfig.name}</p>
            <p className="type-body">{siteConfig.method}</p>
            <p className="type-caption text-ink-subtle">
              {siteConfig.availability}
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="type-accent-link w-fit pt-2"
            >
              {siteConfig.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3 sm:flex-row sm:gap-8">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="type-caption text-ink-subtle no-underline hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="type-caption mt-12 text-ink-faint">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
