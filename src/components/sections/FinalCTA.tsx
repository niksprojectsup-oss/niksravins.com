import type { PublicContent } from "@/content/i18n/types";
import {
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
      className="!pt-5 !pb-6 md:!pt-5 md:!pb-8 lg:!pt-5 lg:!pb-10"
    >
      <div className="max-w-prose">
        <h2 id="contact-heading" className="sr-only">
          {sectionLabels.contactHeading}
        </h2>

        <InternationalSessionNotice
          line1={internationalNotice.line1}
          line2={internationalNotice.line2}
        />

        <div className="mt-5 flex flex-col gap-5 md:mt-6 md:gap-6 sm:flex-row sm:items-center">
          <Button href={finalCta.button.href} variant="booking">
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
