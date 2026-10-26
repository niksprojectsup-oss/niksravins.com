import { getResolvedPublicContent } from "@/lib/i18n/resolve-public-content";
import type { PublicContent } from "@/content/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { publicCmsLocale } from "@/lib/cms/definitions";
import { applyCmsSeoFieldsToHomeContent } from "@/lib/cms/merge-homepage";
import { cmsHtmlFieldsForRequestedLocale } from "@/lib/cms/locale-render";
import { getPreviewCmsPageContent } from "@/lib/cms/preview-page-content";
import type { CmsTiptapJson } from "@/lib/cms/types";
import type { PublicHomePageData } from "@/lib/cms/public-content";

export type PreviewLegalPageData = {
  content: PublicContent;
  body: CmsTiptapJson | undefined;
};

export async function getPreviewHomeContent(locale: Locale): Promise<PublicHomePageData> {
  const base = await getResolvedPublicContent(locale);
  const cmsLocale = publicCmsLocale(locale);

  if (!cmsLocale || cmsLocale !== locale) {
    return { content: base, cmsHtmlFields: {} };
  }

  try {
    const preview = await getPreviewCmsPageContent("home", cmsLocale);
    const cmsFields =
      preview && preview.locale === cmsLocale ? preview.fields : {};

    return {
      content: applyCmsSeoFieldsToHomeContent(base, cmsFields),
      cmsHtmlFields: cmsHtmlFieldsForRequestedLocale(cmsLocale, preview),
    };
  } catch {
    return { content: base, cmsHtmlFields: {} };
  }
}

export async function getPreviewLegalContent(locale: Locale): Promise<PreviewLegalPageData> {
  const content = await getResolvedPublicContent(locale);
  const cmsLocale = publicCmsLocale(locale);

  if (!cmsLocale || cmsLocale !== locale) {
    return { content, body: undefined };
  }

  try {
    const preview = await getPreviewCmsPageContent("legal", cmsLocale);
    const body =
      preview && preview.locale === cmsLocale ? preview.fields.body : undefined;
    return { content, body };
  } catch {
    return { content, body: undefined };
  }
}
