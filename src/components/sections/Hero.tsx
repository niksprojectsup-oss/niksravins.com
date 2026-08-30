import type { PublicContent } from "@/content/i18n/types";
import { Button } from "@/components/ui/Button";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";

type HeroProps = {
  content: PublicContent;
};

export function Hero({ content }: HeroProps) {
  const { hero, internationalNotice } = content;

  return (
    <section
      aria-labelledby="hero-heading"
      className="pt-8 pb-10 md:pt-20 md:pb-20 lg:pt-24 lg:pb-32"
    >
      <div className="layout-container">
        <div className="layout-stack-lg max-w-wide">
          <h1 id="hero-heading" className="type-display max-w-content">
            {hero.headline}
          </h1>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href={hero.primaryCta.href} variant="booking">
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </Button>
          </div>

          <InternationalSessionNotice
            line1={internationalNotice.line1}
            line2={internationalNotice.line2}
            className="max-w-prose text-ink-faint"
          />

          <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2 md:gap-6 md:pt-4 lg:grid-cols-3 lg:pt-6">
            {hero.explanation.map((paragraph) => (
              <article
                key={paragraph.slice(0, 32)}
                className="observed-card flex h-full flex-col p-5 md:p-6"
              >
                <p className="type-body leading-relaxed text-ink-muted">{paragraph}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
