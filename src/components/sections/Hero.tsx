import { hero } from "@/content/site";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="pt-8 pb-10 md:pt-20 md:pb-20 lg:pt-24 lg:pb-32"
    >
      <div className="layout-container">
        <div className="layout-stack-lg max-w-wide">
          <p className="type-label">{hero.name}</p>

          <h1 id="hero-heading" className="type-display max-w-content">
            {hero.headline}
          </h1>

          <div className="layout-stack-md max-w-prose pt-1 md:pt-4">
            {hero.explanation.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="type-editorial">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-4 pt-5 md:gap-5 md:pt-8 sm:flex-row sm:items-center">
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
