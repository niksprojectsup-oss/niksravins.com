import type { Metadata } from "next";
import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import type { CmsLocale } from "@/lib/cms/definitions";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";
import type { StandaloneCmsPageSlug } from "@/lib/cms/published-page-content";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import { absoluteUrl } from "@/lib/seo/metadata";

export async function buildStandaloneCmsPageMetadata(
  slug: StandaloneCmsPageSlug,
  locale: CmsLocale = "en",
): Promise<Metadata> {
  const fallback = await getResolvedPublicContent("en");
  const published = await getPublishedCmsPageContent(slug, locale);

  const title = published?.title ?? fallback.site.name;
  const description =
    (published?.fields.body ? tiptapJsonToPlainText(published.fields.body).slice(0, 160) : null) ??
    fallback.seo.home.description;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${slug}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${slug}`),
      type: "website",
      locale: "en",
      siteName: "Niks Ravins",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
