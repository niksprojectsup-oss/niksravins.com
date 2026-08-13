import type { PublicContent } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";

type TrustProps = {
  content: PublicContent;
};

export function Trust({ content }: TrustProps) {
  const { trust, sectionLabels } = content;

  return (
    <Section size="md" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-prose layout-stack-sm md:layout-stack-md">
        <h2 id="trust-heading" className="sr-only">
          {sectionLabels.trustHeading}
        </h2>
        {trust.statements.map((statement, index) => (
          <p
            key={statement}
            className={
              index === trust.statements.length - 1
                ? "type-editorial text-ink"
                : "type-editorial"
            }
          >
            {statement}
          </p>
        ))}
      </div>
    </Section>
  );
}
