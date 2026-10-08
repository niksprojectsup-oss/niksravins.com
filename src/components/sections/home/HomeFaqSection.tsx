import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { HomeSectionProps } from "./shared";

function FaqAnswer({
  index,
  answer,
  cmsHtmlFields,
}: {
  index: number;
  answer: string | string[];
  cmsHtmlFields: HomeSectionProps["cmsHtmlFields"];
}) {
  const html = cmsHtmlFields?.[`faq.items.${index}.answer`];

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
      <div className="home-prose">
        {answer.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return <p>{answer}</p>;
}

export function HomeFaqSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { faq } = content;

  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading" className="home-band">
      <header className="home-copy home-section-intro">
        <p className="type-label">
          <CmsPublishedFieldText
            html={cmsHtmlFields["faq.headingLabel"]}
            fallback={faq.headingLabel}
            className={CMS_PUBLISHED_INLINE_CLASS}
          />
        </p>
        <h2 id="faq-heading" className="type-home-title">
          <CmsPublishedFieldText
            html={cmsHtmlFields["faq.heading"]}
            fallback={faq.heading}
            className={CMS_PUBLISHED_INLINE_CLASS}
          />
        </h2>
      </header>

      <div className="home-faq">
        {faq.items.map((item, index) => {
          const triggerId = `faq-trigger-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <details key={item.question} className="home-faq-row" name="home-faq">
              <summary id={triggerId} className="home-faq-summary home-faq-trigger">
                <h3 className="home-faq-question">
                  <span>
                    <CmsPublishedFieldText
                      html={cmsHtmlFields[`faq.items.${index}.question`]}
                      fallback={item.question}
                      className={CMS_PUBLISHED_INLINE_CLASS}
                    />
                  </span>
                  <span className="home-faq-mark" aria-hidden="true" />
                </h3>
              </summary>
              <div id={panelId} role="region" aria-labelledby={triggerId} className="home-faq-panel">
                <div className="home-faq-panel-inner">
                  <div className="home-faq-answer type-body">
                    <FaqAnswer index={index} answer={item.answer} cmsHtmlFields={cmsHtmlFields} />
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </Section>
  );
}
