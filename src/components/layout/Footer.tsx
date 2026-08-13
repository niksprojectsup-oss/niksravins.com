import Link from "next/link";
import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

type FooterProps = {
  content: PublicContent;
  locale: Locale;
};

export function Footer({ content, locale }: FooterProps) {
  const year = new Date().getFullYear();
  const homePath = localizedPath(locale, "");

  return (
    <footer className="border-t border-border-subtle">
      <div className="layout-container layout-section-sm">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="layout-stack-sm max-w-prose">
            <p className="font-display text-xl text-ink">{content.site.name}</p>
            <p className="type-body">{content.site.method}</p>
            <p className="type-caption text-ink-subtle">
              {content.site.availability}
            </p>
            <p className="type-caption text-ink-subtle">
              {content.internationalNotice.line1} · {content.internationalNotice.line2}
            </p>
            <a
              href={`mailto:${content.site.email}`}
              className="type-accent-link w-fit pt-2"
            >
              {content.site.email}
            </a>
          </div>

          <div className="flex flex-col gap-8">
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                {content.navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="type-caption text-ink-subtle no-underline hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={content.site.bookingUrl}
                    className="type-caption text-ink-subtle no-underline hover:text-ink"
                  >
                    {content.header.book}
                  </Link>
                </li>
              </ul>
            </nav>
            <LanguageSwitcher label={content.languageSwitcherLabel} />
          </div>
        </div>

        <p className="type-caption mt-12 text-ink-faint">
          © {year}{" "}
          <Link href={homePath} className="text-inherit no-underline hover:text-ink">
            {content.site.name}
          </Link>
          . {content.footer.rights}
        </p>
      </div>
    </footer>
  );
}
