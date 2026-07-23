import { about } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <Section id="about" size="lg" aria-labelledby="about-heading">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20 lg:items-start">
        <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden surface-muted"
            role="img"
            aria-label="Professional portrait placeholder for Niks Ravins"
          >
            <div
              aria-hidden
              className="absolute inset-8 border border-border-subtle"
            />
            <span
              aria-hidden
              className="absolute bottom-10 left-10 font-display text-5xl tracking-tight text-ink-faint/60"
            >
              NR
            </span>
          </div>
        </div>

        <div className="layout-stack-md max-w-prose lg:max-w-none lg:pt-4">
          <SectionHeading
            id="about-heading"
            label="About"
            title="Clinical work, human pace"
          />

          <div className="layout-stack-sm">
            {about.story.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="type-body">
                {paragraph}
              </p>
            ))}
          </div>

          <blockquote className="border-l border-accent-muted pl-6">
            <p className="type-lead text-ink">{about.why}</p>
          </blockquote>
        </div>
      </div>
    </Section>
  );
}
