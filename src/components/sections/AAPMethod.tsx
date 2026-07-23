import { aap } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AAPMethod() {
  return (
    <Section id="aap" size="lg" aria-labelledby="aap-heading">
      <SectionHeading
        id="aap-heading"
        label="Method"
        title={aap.title}
        description={aap.intro}
        className="mb-stack-lg max-w-content"
      />

      <ol className="grid gap-6 md:grid-cols-2 md:gap-8">
        {aap.steps.map((step) => (
          <li key={step.number} className="surface-base p-8 md:p-10">
            <div className="layout-stack-sm">
              <span className="type-label text-accent" aria-hidden>
                {step.number}
              </span>
              <h3 className="type-heading-sm">{step.title}</h3>
              <p className="type-body">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
