import { getPublicContent } from "@/content/i18n";
import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import type { CmsLocale } from "@/lib/cms/definitions";
import {
  applyCmsSeoFieldsToHomeContent,
  isCmsSupportedPublicLocale,
} from "@/lib/cms/merge-homepage";
import {
  buildPublishedCmsHtmlFields,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import { getPublishedCmsPageContent } from "@/lib/cms/published-page-content";

function toCmsLocale(locale: string): CmsLocale | null {
  if (locale === "en" || locale === "lv") return locale;
  return null;
}

export type PublicHomePageData = {
  content: PublicContent;
  cmsHtmlFields: CmsHtmlFields;
};

export async function getPublicHomeContent(locale: Locale): Promise<PublicHomePageData> {
  const base = getPublicContent(locale);

  if (!isCmsSupportedPublicLocale(locale)) {
    return { content: base, cmsHtmlFields: {} };
  }

  const cmsLocale = toCmsLocale(locale);
  if (!cmsLocale) {
    return { content: base, cmsHtmlFields: {} };
  }

  try {
    const published = await getPublishedCmsPageContent("home", cmsLocale);
    const cmsFields = published?.fields ?? {};

    return {
      content: applyCmsSeoFieldsToHomeContent(base, cmsFields),
      cmsHtmlFields: buildPublishedCmsHtmlFields(cmsFields),
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
