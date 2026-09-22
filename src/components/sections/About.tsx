import Image from "next/image";
import { flattenCmsParagraphField } from "@/content/cms/tiptap-blocks";
import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type AboutProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function About({ content, cmsHtmlFields = {} }: AboutProps) {
  const { about, sectionLabels } = content;

  return (
    <Section id="about" size="lg" aria-labelledby="about-heading">
      <div className="grid gap-12 md:gap-16 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-24 lg:items-start">
        <div className="mx-auto w-full max-w-[14rem] lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-muted">
            <Image
              src="/images/niks.jpg"
              alt={sectionLabels.aboutImageAlt}
              fill
              sizes="(max-width: 1024px) 224px, 256px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="layout-stack-sm max-w-prose md:layout-stack-md lg:max-w-none lg:layout-stack-lg">
          <h2 id="about-heading" className="type-heading">
            <CmsPublishedFieldText
              html={cmsHtmlFields["about.title"]}
              fallback={about.title}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </h2>

          <div className="layout-stack-sm md:layout-stack-md">
            {about.story.map((paragraph, index) => (
              <div
                key={flattenCmsParagraphField(paragraph).slice(0, 32)}
                className="type-body"
              >
                <CmsPublishedFieldText
                  html={cmsHtmlFields[`about.story.${index}`]}
                  fallback={flattenCmsParagraphField(paragraph)}
                  className={CMS_PUBLISHED_BLOCK_CLASS}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
