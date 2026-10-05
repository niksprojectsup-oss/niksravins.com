import { Section } from "@/components/ui/Section";
import { homeNarrative, PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomeIdentitySection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { identity } = homeNarrative(content);

  return (
    <Section id="identity" size="lg" aria-labelledby="identity-heading" className="home-band">
      <div className="home-copy">
        <h2 id="identity-heading" className="type-home-title">
          {identity.heading}
        </h2>
        <PublishedParagraphs
          html={cmsHtmlFields["about.story.1"]}
          fallback={identity.paragraphs}
        />
      </div>
      <ol className="home-shifts">
        {identity.shifts.map((shift) => (
          <li key={shift.from} className="home-shift">
            <p>
              <span className="sr-only">From </span>
              {shift.from}
            </p>
            <span className="home-shift-mark" aria-hidden="true">
              →
            </span>
            <p>
              <span className="sr-only">To </span>
              {shift.to}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
