import { Section } from "@/components/ui/Section";
import { homeNarrative, type HomeSectionProps } from "./shared";

export function HomeLifeAreasSection({ content }: HomeSectionProps) {
  const { change } = homeNarrative(content);

  return (
    <Section size="lg" aria-labelledby="life-areas-heading" className="home-band">
      <div className="home-split">
        <h2 id="life-areas-heading" className="type-home-title">
          {change.heading}
        </h2>
        <ul className="home-change-list">
          {change.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
