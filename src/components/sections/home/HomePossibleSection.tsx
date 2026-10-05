import { Section } from "@/components/ui/Section";
import { homeNarrative, PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomePossibleSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { possible } = homeNarrative(content);
  const point = content.aap.points[3];

  return (
    <Section size="lg" aria-labelledby="possible-heading" className="home-band">
      <div className="home-copy home-copy-lead">
        <h2 id="possible-heading" className="type-home-title">
          {possible.heading}
        </h2>
        {point ? (
          <PublishedParagraphs
            html={cmsHtmlFields["aap.points.3.description"]}
            fallback={point.description}
          />
        ) : null}
      </div>
    </Section>
  );
}
