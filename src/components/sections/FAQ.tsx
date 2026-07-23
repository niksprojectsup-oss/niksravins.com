import { faq } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQ() {
  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading">
      <SectionHeading
        id="faq-heading"
        label="Questions"
        title="Common questions"
        className="mb-stack-lg"
      />

      <dl className="mx-auto max-w-content divide-y divide-border-subtle border-y border-border-subtle">
        {faq.map((item) => (
          <div key={item.question} className="py-8 first:pt-0 last:pb-0">
            <dt>
              <h3 className="type-heading-sm text-xl">{item.question}</h3>
            </dt>
            <dd className="type-body mt-4">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
