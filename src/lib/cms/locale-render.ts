import type { CmsLocale } from "@/lib/cms/definitions";
import {
  buildPublishedCmsHtmlFields,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import type { CmsPublishedPageContent } from "@/lib/cms/published-page-content";

export function cmsHtmlFieldsForRequestedLocale(
  requestedLocale: string,
  published: Pick<CmsPublishedPageContent, "locale" | "fields"> | null,
): CmsHtmlFields {
  if (!published || published.locale !== requestedLocale) {
    return {};
  }

  return buildPublishedCmsHtmlFields(published.fields);
}

export function assertRequestedCmsLocale(
  requestedLocale: string,
  cmsLocale: CmsLocale | null,
): CmsLocale | null {
  if (!cmsLocale || cmsLocale !== requestedLocale) {
    return null;
  }
  return cmsLocale;
}
