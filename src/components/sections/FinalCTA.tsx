import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Button } from "@/components/ui/Button";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type FinalCTAProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function FinalCTA({ content, cmsHtmlFields = {} }: FinalCTAProps) {
  const { finalCta, site, internationalNotice, sectionLabels } = content;

  return (
    <Section
      id="contact"
      size="lg"
      aria-labelledby="contact-heading"
      className="!pb-10 md:!pb-20 lg:!pb-32"
    >
      <div className="max-w-prose layout-stack-md md:layout-stack-lg">
        <h2 id="contact-heading" className="sr-only">
          {sectionLabels.contactHeading}
        </h2>

        <div className="layout-stack-sm">
          {finalCta.lines.map((line, index) => (
            <div key={line} className="type-heading-sm text-ink">
              <CmsPublishedFieldText
                html={cmsHtmlFields[`finalCta.lines.${index}`]}
                fallback={line}
                className={CMS_PUBLISHED_BLOCK_CLASS}
              />
            </div>
          ))}
        </div>

        <InternationalSessionNotice
          line1={internationalNotice.line1}
          line2={internationalNotice.line2}
        />

        <div className="flex flex-col gap-5 pt-2 md:gap-6 md:pt-4 sm:flex-row sm:items-center">
          <Button href={finalCta.button.href}>
            <CmsPublishedFieldText
              html={cmsHtmlFields["finalCta.button.label"]}
              fallback={finalCta.button.label}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </Button>
          <a
            href={`mailto:${site.email}`}
            className="type-caption text-ink-subtle no-underline hover:text-accent"
          >
            {site.email}
          </a>
        </div>
      </div>
    </Section>
  );
}
