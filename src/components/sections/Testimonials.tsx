import { testimonials } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Testimonials() {
  return (
    <Section size="lg" aria-labelledby="testimonials-heading">
      <div className="max-w-wide">
        <header className="layout-stack-sm layout-section-header max-w-prose md:layout-stack-md">
          <p className="type-label">Observed changes</p>
          <h2 id="testimonials-heading" className="type-heading">
            What shifts in daily life
          </h2>
          <p className="type-body">{testimonials.intro}</p>
        </header>

        <ul className="grid list-none gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {testimonials.items.map((item, index) => (
            <li key={item.title} className="flex">
              <Reveal delay={index * 80} className="flex flex-1">
                <article className="observed-card flex flex-1 flex-col p-7 md:p-8">
                  <h3 className="type-heading-sm">{item.title}</h3>
                  <p className="type-body mt-4 flex-1">{item.description}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
