import { getPublicContent } from "@/content/i18n";
import type { PublicContent } from "@/content/i18n/types";
import { CmsPublishedBody } from "@/components/cms/CmsPublishedBody";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/ui/Section";
import { isCmsSupportedPublicLocale } from "@/lib/cms/merge-homepage";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";
import type { StandaloneCmsPageSlug } from "@/lib/cms/published-page-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { CmsLocale } from "@/lib/cms/definitions";

type PublicStandaloneCmsPageProps = {
  slug: StandaloneCmsPageSlug;
  locale?: Locale;
};

function toCmsLocale(locale: Locale): CmsLocale | null {
  if (locale === "en") return "en";
  return null;
}

function LegalFallback({ content }: { content: PublicContent }) {
  return (
    <Section size="lg" aria-labelledby="legal-heading">
      <div className="max-w-prose layout-stack-md">
        <h1 id="legal-heading" className="type-heading">
          {content.legal.heading}
        </h1>
        <p className="type-body">{content.legal.body}</p>
        <p className="type-body">
          {content.legal.contactLabel}{" "}
          <a href={`mailto:${content.site.email}`} className="text-accent underline">
            {content.site.email}
          </a>
        </p>
      </div>
    </Section>
  );
}

export async function PublicStandaloneCmsPage({
  slug,
  locale = DEFAULT_LOCALE,
}: PublicStandaloneCmsPageProps) {
  if (slug !== "legal") {
    throw new Error(`Unsupported standalone CMS page slug: ${slug}`);
  }

  const content = getPublicContent(locale);
  const cmsLocale =
    isCmsSupportedPublicLocale(locale) ? toCmsLocale(locale) : null;
  const published = cmsLocale
    ? await getPublishedCmsPageContent(slug, cmsLocale)
    : null;
  const publishedBody = published?.fields.body;

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2B2B27]">
      <Header content={content} locale={locale} />
      <main>
        {publishedBody ? (
          <Section size="lg" aria-labelledby={`${slug}-cms-heading`}>
            <div className="max-w-wide">
              <CmsPublishedBody document={publishedBody} />
            </div>
          </Section>
        ) : (
          <LegalFallback content={content} />
        )}
      </main>
      <Footer content={content} locale={locale} />
    </div>
  );
}
