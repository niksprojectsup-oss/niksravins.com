import { about } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" size="lg" aria-labelledby="about-heading">
      <div className="grid gap-12 md:gap-16 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-24 lg:items-start">
        <div className="mx-auto w-full max-w-[14rem] lg:mx-0 lg:max-w-none">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden bg-surface-muted"
            role="img"
            aria-label="Professional portrait placeholder for Niks Ravins"
          >
            <div
              aria-hidden
              className="absolute inset-6 border border-border-subtle"
            />
            <span
              aria-hidden
              className="absolute bottom-8 left-8 font-display text-4xl tracking-tight text-ink-faint/50"
            >
              NR
            </span>
          </div>
        </div>

        <div className="layout-stack-sm max-w-prose md:layout-stack-md lg:max-w-none lg:layout-stack-lg">
          <h2 id="about-heading" className="type-heading">
            {about.title}
          </h2>

          <div className="layout-stack-sm md:layout-stack-md">
            {about.story.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="type-body">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
