import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";
import { EmphasizedText } from "./shared";

type HomeWantChangeSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

function SectionHeading({
  id,
  className,
  html,
  fallback,
}: {
  id: string;
  className: string;
  html?: string;
  fallback: string;
}) {
  if (html) {
    return (
      <h2
        id={id}
        className={`${className} cms-published-text`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <h2 id={id} className={className}>
      {fallback}
    </h2>
  );
}

function StepBody({
  html,
  parts,
}: {
  html?: string;
  parts: PublicContent["journey"]["steps"][number];
}) {
  if (html) {
    return <CmsPublishedFieldText html={html} fallback="" className="want-change-text" />;
  }

  return <EmphasizedText as="p" parts={parts} className="want-change-text" />;
}

export function HomeWantChangeSection({
  content,
  cmsHtmlFields = {},
}: HomeWantChangeSectionProps) {
  return (
    <Section id="want-change" aria-labelledby="want-change-heading" className="want-change">
      <div className="want-change-inner">
        <SectionHeading
          id="want-change-heading"
          className="want-change-title"
          html={cmsHtmlFields["journey.heading"]}
          fallback={content.journey.heading}
        />
        <div className="want-change-path">
          {content.journey.steps.map((parts, index) => {
            const number = String(index + 1).padStart(2, "0");

            return (
              <article key={number} className="want-change-stage" data-stage={number}>
                <span className="want-change-num">{number}</span>
                <span className="want-change-rule" aria-hidden="true" />
                <StepBody
                  html={cmsHtmlFields[`journey.change.${index}`]}
                  parts={parts}
                />
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
