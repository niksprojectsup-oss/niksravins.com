import { testimonials } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials() {
  return (
    <Section
      size="lg"
      aria-labelledby="testimonials-heading"
      className="bg-surface-muted/50"
    >
      <SectionHeading
        id="testimonials-heading"
        label="Reflections"
        title="What shifts when the body catches up"
        className="mb-stack-lg"
      />

      <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
        {testimonials.map((item, index) => (
          <li key={item.attribution}>
            <Reveal delay={index * 120}>
              <figure className="surface-elevated flex h-full flex-col justify-between p-8 md:p-10">
                <blockquote className="layout-stack-sm">
                  <p className="font-display text-lg leading-relaxed text-ink">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="type-caption mt-8 pt-6 border-t border-border-subtle">
                  {item.attribution}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
