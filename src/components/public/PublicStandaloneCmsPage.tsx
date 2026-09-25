import { getPublicContent } from "@/content/i18n";
import type { PublicContent } from "@/content/i18n/types";
import { CmsPublishedBody } from "@/components/cms/CmsPublishedBody";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Section } from "@/components/ui/Section";
import type { CmsLocale } from "@/lib/cms/definitions";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";
import type { StandaloneCmsPageSlug } from "@/lib/cms/published-page-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

type PublicStandaloneCmsPageProps = {
  slug: StandaloneCmsPageSlug;
  locale?: CmsLocale;
};

function getFallbackPublicContent(): PublicContent {
  return getPublicContent("en");
}

function getPublicLocale(): Locale {
  return DEFAULT_LOCALE;
}

function LegalFallback({ content }: { content: PublicContent }) {
  return (
    <Section size="lg" aria-labelledby="legal-heading">
      <div className="max-w-prose layout-stack-md">
        <h1 id="legal-heading" className="type-heading">
          Legal
        </h1>
        <p className="type-body">
          {content.site.name}. {content.footer.rights}
        </p>
        <p className="type-body">
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
  locale = "en",
}: PublicStandaloneCmsPageProps) {
  if (slug !== "legal") {
    throw new Error(`Unsupported standalone CMS page slug: ${slug}`);
  }

  const fallbackContent = getFallbackPublicContent();
  const publicLocale = getPublicLocale();
  const published = await getPublishedCmsPageContent(slug, locale);
  const publishedBody = published?.fields.body;

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2B2B27]">
      <Header content={fallbackContent} locale={publicLocale} />
      <main>
        {publishedBody ? (
          <Section size="lg" aria-labelledby={`${slug}-cms-heading`}>
            <div className="max-w-wide">
              <CmsPublishedBody document={publishedBody} />
            </div>
          </Section>
        ) : (
          <LegalFallback content={fallbackContent} />
        )}
      </main>
      <Footer content={fallbackContent} locale={publicLocale} />
    </div>
  );
}
