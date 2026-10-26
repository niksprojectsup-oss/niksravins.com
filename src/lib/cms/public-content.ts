import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { publicCmsLocale } from "@/lib/cms/definitions";
import { applyCmsSeoFieldsToHomeContent } from "@/lib/cms/merge-homepage";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";
import { cmsHtmlFieldsForRequestedLocale } from "@/lib/cms/locale-render";

export type PublicHomePageData = {
  content: PublicContent;
  cmsHtmlFields: CmsHtmlFields;
};

export async function getPublicHomeContent(locale: Locale): Promise<PublicHomePageData> {
  const base = await getResolvedPublicContent(locale);
  const cmsLocale = publicCmsLocale(locale);

  if (!cmsLocale) {
    return { content: base, cmsHtmlFields: {} };
  }

  try {
    const published = await getPublishedCmsPageContent("home", cmsLocale);
    const cmsFields =
      published && published.locale === cmsLocale ? published.fields : {};

    return {
      content: applyCmsSeoFieldsToHomeContent(base, cmsFields),
      cmsHtmlFields: cmsHtmlFieldsForRequestedLocale(cmsLocale, published),
    };
  } catch {
    return { content: base, cmsHtmlFields: {} };
  }
}

export async function getPublicHomeMetadata(locale: Locale) {
  const { content } = await getPublicHomeContent(locale);
  return {
    title: content.seo.home.title,
    description: content.seo.home.description,
    content,
  };
}
