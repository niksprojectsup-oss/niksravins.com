import { testimonials } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Testimonials() {
  return (
    <Section size="lg" aria-labelledby="testimonials-heading">
      <div className="layout-stack-xl max-w-wide">
        <header className="max-w-prose layout-stack-sm">
          <p className="type-label">Observed changes</p>
          <h2 id="testimonials-heading" className="type-heading">
            What shifts in daily life
          </h2>
        </header>

        <ul className="layout-stack-lg list-none">
          {testimonials.map((item, index) => (
            <li
              key={item.before}
              className="border-t border-border-subtle pt-stack-md first:border-t-0 first:pt-0"
            >
              <Reveal delay={index * 100}>
                <figure className="max-w-prose layout-stack-md">
                  <blockquote className="layout-stack-sm">
                    <p className="type-body">
                      <span className="text-ink-faint">Before: </span>
                      {item.before}
                    </p>
                    <p className="type-editorial text-ink">
                      <span className="font-sans text-sm text-ink-faint">
                        After:{" "}
                      </span>
                      {item.after}
                    </p>
                  </blockquote>
                  <figcaption className="type-caption">
                    {item.attribution}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
