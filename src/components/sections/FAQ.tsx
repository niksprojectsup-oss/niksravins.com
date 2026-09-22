import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type FAQProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

function FaqAnswer({
  index,
  answer,
  cmsHtmlFields,
}: {
  index: number;
  answer: string | string[];
  cmsHtmlFields: CmsHtmlFields;
}) {
  const html = cmsHtmlFields[`faq.items.${index}.answer`];

  if (html) {
    return (
      <CmsPublishedFieldText
        html={html}
        fallback={Array.isArray(answer) ? answer.join("\n\n") : answer}
        className={CMS_PUBLISHED_BLOCK_CLASS}
      />
    );
  }

  if (Array.isArray(answer)) {
    return (
      <div className="layout-stack-sm">
        {answer.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return answer;
}

export function FAQ({ content, cmsHtmlFields = {} }: FAQProps) {
  const { faq } = content;

  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading">
      <div className="max-w-prose">
        <header className="layout-stack-sm layout-section-header">
          <p className="type-label">
            <CmsPublishedFieldText
              html={cmsHtmlFields["faq.headingLabel"]}
              fallback={faq.headingLabel}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </p>
          <h2 id="faq-heading" className="type-heading">
            <CmsPublishedFieldText
              html={cmsHtmlFields["faq.heading"]}
              fallback={faq.heading}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </h2>
        </header>

        <dl className="layout-stack-md md:layout-stack-lg">
          {faq.items.map((item, index) => (
            <div
              key={item.question}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 md:pt-stack-md"
            >
              <dt>
                <h3 className="type-heading-sm">
                  <CmsPublishedFieldText
                    html={cmsHtmlFields[`faq.items.${index}.question`]}
                    fallback={item.question}
                    className={CMS_PUBLISHED_INLINE_CLASS}
                  />
                </h3>
              </dt>
              <dd className="type-body mt-4 md:mt-5">
                <FaqAnswer index={index} answer={item.answer} cmsHtmlFields={cmsHtmlFields} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
