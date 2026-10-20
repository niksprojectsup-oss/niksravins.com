import Link from "next/link";
import type { PortalContent } from "@/content/i18n/portal";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { siteConfig } from "@/content/site";

type PortalFooterProps = {
  content: PortalContent;
  locale: Locale;
};

export function PortalFooter({ content, locale }: PortalFooterProps) {
  const legalPath = localizedPath(locale, "legal");

  return (
    <footer className="border-t border-[#eadfd2] bg-[#f7f1e8]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-5 text-sm text-[#6d675f] md:flex-row md:items-center md:justify-between md:px-6">
        <p className="font-display tracking-[0.18em] text-[#3f3a34]">NIKS RAVINS</p>
        <p className="max-w-md text-center">
          “{content.footer.quote}” — {content.hero.quoteBy}
        </p>
        <nav aria-label={content.footer.support} className="flex flex-wrap gap-4">
          <Link href={legalPath} className="text-[#6d675f] no-underline hover:text-[#2f2b26]">
            {content.footer.privacy}
          </Link>
          <Link href={legalPath} className="text-[#6d675f] no-underline hover:text-[#2f2b26]">
            {content.footer.terms}
          </Link>
          <a href={`mailto:${siteConfig.email}`} className="text-[#6d675f] no-underline hover:text-[#2f2b26]">
            {content.footer.support}
          </a>
        </nav>
      </div>
    </footer>
  );
}
