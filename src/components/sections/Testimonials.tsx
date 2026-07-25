import { testimonials } from "@/content/site";
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

        <ul className="grid grid-cols-1 list-none gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {testimonials.items.map((item) => (
            <li key={item.title}>
              <article className="observed-card flex w-full flex-col p-7 md:h-full md:p-8">
                <h3 className="type-heading-sm">{item.title}</h3>
                <p className="type-body mt-4 flex-1">{item.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
