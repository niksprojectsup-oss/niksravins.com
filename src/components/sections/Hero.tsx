import { hero } from "@/content/site";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="layout-section-lg pt-12 md:pt-24"
    >
      <div className="layout-container">
        <div className="layout-stack-xl max-w-wide">
          <p className="type-label">{hero.name}</p>

          <h1 id="hero-heading" className="type-display max-w-content">
            {hero.headline}
          </h1>

          <div className="layout-stack-md max-w-prose pt-4">
            {hero.explanation.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="type-editorial">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center">
            <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
