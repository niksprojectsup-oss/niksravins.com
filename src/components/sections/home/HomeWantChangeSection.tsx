import type { ReactNode } from "react";
import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

const STEP_FALLBACKS: readonly ReactNode[] = [
  <>
    Maybe it’s your <strong>relationship</strong>. Maybe it’s your <strong>work</strong>. Maybe it’s
    how you feel about <strong>yourself</strong>. Maybe you simply know you want{" "}
    <strong>more from life</strong>.
  </>,
  <>
    You understand what <strong>isn’t</strong> working.
  </>,
  <>
    You may even understand what is <strong>holding you back</strong>.
  </>,
  <>
    But knowing something <strong>doesn’t always make it change</strong>.
  </>,
];

function StepBody({ index, html }: { index: number; html?: string }) {
  if (html) {
    return <CmsPublishedFieldText html={html} fallback="" className="want-change-text" />;
  }

  return <p className="want-change-text">{STEP_FALLBACKS[index]}</p>;
}

export function HomeWantChangeSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  return (
    <Section aria-labelledby="want-change-heading" className="want-change">
      <div className="want-change-inner">
        <h2 id="want-change-heading" className="want-change-title">
          You want something to change.
        </h2>
        <div className="want-change-path">
          {STEP_FALLBACKS.map((_, index) => {
            const number = String(index + 1).padStart(2, "0");

            return (
              <article key={number} className="want-change-stage" data-stage={number}>
                <span className="want-change-num">{number}</span>
                <span className="want-change-rule" aria-hidden="true" />
                <StepBody index={index} html={cmsHtmlFields[`journey.change.${index}`]} />
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
