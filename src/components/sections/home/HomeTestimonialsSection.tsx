import { Section } from "@/components/ui/Section";
import { homeNarrative, type HomeSectionProps } from "./shared";

export function HomeTestimonialsSection({ content }: HomeSectionProps) {
  const { experiences } = homeNarrative(content);

  return (
    <Section size="lg" aria-labelledby="testimonials-heading" className="home-band">
      <div className="home-copy home-section-intro">
        <h2 id="testimonials-heading" className="type-home-title">
          {experiences.heading}
        </h2>
      </div>
      <ol className="home-experiences">
        {experiences.items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className="home-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
