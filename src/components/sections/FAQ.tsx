import { faq } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function FAQ() {
  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading">
      <div className="max-w-prose">
        <header className="layout-stack-sm layout-section-header">
          <p className="type-label">Questions</p>
          <h2 id="faq-heading" className="type-heading">
            What people ask
          </h2>
        </header>

        <dl className="layout-stack-md md:layout-stack-lg">
          {faq.map((item) => (
            <div
              key={item.question}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 md:pt-stack-md"
            >
              <dt>
                <h3 className="type-heading-sm">{item.question}</h3>
              </dt>
              <dd className="type-body mt-4 md:mt-5">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
