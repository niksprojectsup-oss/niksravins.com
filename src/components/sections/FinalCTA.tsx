import { finalCta, siteConfig } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <Section
      id="contact"
      size="lg"
      aria-labelledby="contact-heading"
      className="!pb-10 md:!pb-20 lg:!pb-32"
    >
      <div className="max-w-prose layout-stack-md md:layout-stack-lg">
        <h2 id="contact-heading" className="sr-only">
          Contact
        </h2>

        <div className="layout-stack-sm">
          {finalCta.lines.map((line) => (
            <p key={line} className="type-heading-sm text-ink">
              {line}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-5 pt-2 md:gap-6 md:pt-4 sm:flex-row sm:items-center">
          <Button href={finalCta.button.href}>{finalCta.button.label}</Button>
          <a
            href={`mailto:${siteConfig.email}`}
            className="type-caption text-ink-subtle no-underline hover:text-accent"
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </Section>
  );
}
