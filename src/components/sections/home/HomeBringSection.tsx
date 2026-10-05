import { Section } from "@/components/ui/Section";
import { PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomeBringSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { trust, sectionLabels } = content;

  return (
    <Section size="lg" aria-labelledby="bring-heading" className="home-band">
      <div className="home-split">
        <h2 id="bring-heading" className="type-home-title">
          {sectionLabels.trustHeading}
        </h2>
        <div className="home-bring">
          {trust.statements.map((statement, index) => (
            <div key={statement} className="home-bring-line">
              <PublishedParagraphs
                html={cmsHtmlFields[`trust.statements.${index}`]}
                fallback={statement}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
