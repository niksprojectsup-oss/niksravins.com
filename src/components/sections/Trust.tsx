import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type TrustProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function Trust({ content, cmsHtmlFields = {} }: TrustProps) {
  const { trust, sectionLabels } = content;

  return (
    <Section size="md" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-prose layout-stack-sm md:layout-stack-md">
        <h2 id="trust-heading" className="sr-only">
          {sectionLabels.trustHeading}
        </h2>
        {trust.statements.map((statement, index) => (
          <div
            key={statement}
            className={
              index === trust.statements.length - 1
                ? "type-editorial text-ink"
                : "type-editorial"
            }
          >
            <CmsPublishedFieldText
              html={cmsHtmlFields[`trust.statements.${index}`]}
              fallback={statement}
              className={CMS_PUBLISHED_BLOCK_CLASS}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
