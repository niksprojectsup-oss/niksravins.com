import type { PublicContent } from "@/content/i18n/types";
import { Button } from "@/components/ui/Button";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { Section } from "@/components/ui/Section";

type FinalCTAProps = {
  content: PublicContent;
};

export function FinalCTA({ content }: FinalCTAProps) {
  const { finalCta, site, internationalNotice, sectionLabels } = content;

  return (
    <Section
      id="contact"
      size="lg"
      aria-labelledby="contact-heading"
      className="!pb-10 md:!pb-20 lg:!pb-32"
    >
      <div className="max-w-prose layout-stack-md md:layout-stack-lg">
        <h2 id="contact-heading" className="sr-only">
          {sectionLabels.contactHeading}
        </h2>

        <div className="layout-stack-sm">
          {finalCta.lines.map((line) => (
            <p key={line} className="type-heading-sm text-ink">
              {line}
            </p>
          ))}
        </div>

        <InternationalSessionNotice
          line1={internationalNotice.line1}
          line2={internationalNotice.line2}
        />

        <div className="flex flex-col gap-5 pt-2 md:gap-6 md:pt-4 sm:flex-row sm:items-center">
          <Button href={finalCta.button.href}>{finalCta.button.label}</Button>
          <a
            href={`mailto:${site.email}`}
            className="type-caption text-ink-subtle no-underline hover:text-accent"
          >
            {site.email}
          </a>
        </div>
      </div>
    </Section>
  );
}
