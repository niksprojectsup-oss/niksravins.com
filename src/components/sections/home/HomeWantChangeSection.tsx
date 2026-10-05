import { Section } from "@/components/ui/Section";
import { homeNarrative, PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomeWantChangeSection({ content }: HomeSectionProps) {
  const { desire } = homeNarrative(content);

  return (
    <Section id="about" size="lg" aria-labelledby="want-change-heading" className="home-band">
      <div className="home-copy home-copy-lead">
        <h2 id="want-change-heading" className="type-home-title">
          {desire.heading}
        </h2>
        <PublishedParagraphs fallback={desire.paragraphs} />
      </div>
    </Section>
  );
}
