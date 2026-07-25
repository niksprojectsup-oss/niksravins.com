import { trust } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function Trust() {
  return (
    <Section size="md" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-prose layout-stack-sm md:layout-stack-md">
        <h2 id="trust-heading" className="sr-only">
          Why people come here
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
