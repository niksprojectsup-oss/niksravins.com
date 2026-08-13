import type { PublicContent } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";

type AAPMethodProps = {
  content: PublicContent;
};

export function AAPMethod({ content }: AAPMethodProps) {
  const { aap, sectionLabels } = content;

  return (
    <Section id="aap" size="lg" aria-labelledby="aap-heading">
      <div className="max-w-wide">
        <header className="layout-stack-sm layout-section-header max-w-prose md:layout-stack-md">
          <p className="type-label">{sectionLabels.aapLabel}</p>
          <h2 id="aap-heading" className="type-heading">
            {aap.title}
          </h2>
          <p className="type-editorial">{aap.intro}</p>
        </header>

        <ol className="layout-stack-md max-w-prose list-none md:layout-stack-lg">
          {aap.points.map((point, index) => (
            <li
              key={point.title}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 md:pt-stack-md"
            >
              <div className="layout-stack-sm">
                <span className="type-label text-ink-faint" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-heading-sm">{point.title}</h3>
                <p className="type-body">{point.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
