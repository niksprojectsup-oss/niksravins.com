import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import type { PublicContent } from "@/content/i18n/types";
import { CmsPublishedBody } from "@/components/cms/CmsPublishedBody";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/ui/Section";
import { publicCmsLocale } from "@/lib/cms/definitions";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";
import type { StandaloneCmsPageSlug } from "@/lib/cms/published-page-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

type PublicStandaloneCmsPageProps = {
  slug: StandaloneCmsPageSlug;
  locale?: Locale;
};

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

  const content = await getResolvedPublicContent(locale);
  const cmsLocale = publicCmsLocale(locale);
  const published =
    cmsLocale && cmsLocale === locale
      ? await getPublishedCmsPageContent(slug, cmsLocale)
      : null;
  const publishedBody =
    published && published.locale === locale ? published.fields.body : undefined;

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
