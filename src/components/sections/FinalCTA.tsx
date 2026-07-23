import { finalCta, siteConfig } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function FinalCTA() {
  return (
    <Section
      id="contact"
      size="lg"
      aria-labelledby="contact-heading"
      className="pb-section-lg"
    >
      <div className="mx-auto max-w-prose text-center layout-stack-md">
        <h2 id="contact-heading" className="type-heading">
          {finalCta.headline}
        </h2>
        <p className="type-lead">{finalCta.subtext}</p>
        <div className="flex flex-col items-center gap-6 pt-2">
          <Button href={finalCta.button.href}>{finalCta.button.label}</Button>
          <a
            href={`mailto:${siteConfig.email}`}
            className="type-accent-link"
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </Section>
  );
}
