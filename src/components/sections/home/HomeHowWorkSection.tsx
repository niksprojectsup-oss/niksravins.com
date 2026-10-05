import {
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import { homeNarrative, PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomeHowWorkSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { process } = homeNarrative(content);
  const { aap, sectionLabels } = content;
  const steps = aap.points.slice(0, 3);

  return (
    <Section id="aap" size="lg" aria-labelledby="how-work-heading" className="home-band">
      <header className="home-copy home-section-intro">
        <p className="type-label">{sectionLabels.aapLabel}</p>
        <h2 id="how-work-heading" className="type-home-title">
          {process.heading}
        </h2>
        <PublishedParagraphs html={cmsHtmlFields["aap.intro"]} fallback={aap.intro} />
      </header>
      <ol className="home-steps">
        {steps.map((step, index) => (
          <li key={step.title} className="home-step">
            <span className="home-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="home-step-body">
              <h3 className="type-heading-sm">
                <CmsPublishedFieldText
                  html={cmsHtmlFields[`aap.points.${index}.title`]}
                  fallback={step.title}
                  className={CMS_PUBLISHED_INLINE_CLASS}
                />
              </h3>
              <PublishedParagraphs
                html={cmsHtmlFields[`aap.points.${index}.description`]}
                fallback={step.description}
              />
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
