import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Button } from "@/components/ui/Button";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type HeroProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function Hero({ content, cmsHtmlFields = {} }: HeroProps) {
  const { hero, internationalNotice } = content;

  return (
    <section
      aria-labelledby="hero-heading"
      className="pt-8 pb-10 md:pt-20 md:pb-20 lg:pt-24 lg:pb-32"
    >
      <div className="layout-container">
        <div className="layout-stack-lg max-w-wide">
          <h1 id="hero-heading" className="type-display max-w-content">
            <CmsPublishedFieldText
              html={cmsHtmlFields["hero.headline"]}
              fallback={hero.headline}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </h1>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href={hero.primaryCta.href} variant="booking">
              <CmsPublishedFieldText
                html={cmsHtmlFields["hero.primaryCta.label"]}
                fallback={hero.primaryCta.label}
                className={CMS_PUBLISHED_INLINE_CLASS}
              />
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary">
              <CmsPublishedFieldText
                html={cmsHtmlFields["hero.secondaryCta.label"]}
                fallback={hero.secondaryCta.label}
                className={CMS_PUBLISHED_INLINE_CLASS}
              />
            </Button>
          </div>

          <InternationalSessionNotice
            line1={internationalNotice.line1}
            line2={internationalNotice.line2}
            className="max-w-prose text-ink-faint"
          />

          <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2 md:gap-6 md:pt-4 lg:grid-cols-3 lg:pt-6">
            {hero.explanation.map((paragraph, index) => (
              <article
                key={paragraph.slice(0, 32)}
                className="observed-card flex h-full flex-col p-5 md:p-6"
              >
                <div className="type-body leading-relaxed text-ink-muted">
                  <CmsPublishedFieldText
                    html={cmsHtmlFields[`hero.explanation.${index}`]}
                    fallback={paragraph}
                    className={CMS_PUBLISHED_BLOCK_CLASS}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
