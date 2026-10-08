import type { PublicContent } from "@/content/i18n/types";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

export type HomeSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};
