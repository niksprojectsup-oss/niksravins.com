import Link from "next/link";
import {
  CMS_LOCALE_LABELS,
  type CmsLocale,
} from "@/lib/cms/definitions";
import {
  CMS_PREVIEW_LOCALES,
  cmsPreviewEditorPath,
  cmsPreviewPath,
  type CmsPreviewPageSlug,
} from "@/lib/cms/preview-page-content";
import { cn } from "@/lib/utils";

type CmsPreviewChromeProps = {
  slug: CmsPreviewPageSlug;
  locale: CmsLocale;
  children: React.ReactNode;
};

export function CmsPreviewChrome({ slug, locale, children }: CmsPreviewChromeProps) {
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2B2B27]">
      <div
        role="banner"
        className="sticky top-0 z-50 border-b border-border-subtle bg-canvas/95 px-4 py-3 backdrop-blur md:px-6"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="layout-stack-xs">
            <p className="type-caption font-medium text-ink">Draft preview — not published</p>
            <p className="type-caption text-ink-subtle">
              Saved {locale.toUpperCase()} draft for /{slug}. Public pages still show published
              content only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CMS_PREVIEW_LOCALES.map((entry) => (
              <Link
                key={entry}
                href={cmsPreviewPath(slug, entry)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm no-underline transition-colors",
                  locale === entry
                    ? "bg-accent/10 text-accent"
                    : "text-ink-subtle hover:bg-surface hover:text-ink",
                )}
              >
                {CMS_LOCALE_LABELS[entry]}
              </Link>
            ))}
            <Link
              href={cmsPreviewEditorPath(slug, locale)}
              className="type-accent-link type-caption ml-2"
            >
              Back to editor
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
