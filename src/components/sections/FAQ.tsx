import type { PublicContent } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";

type FAQProps = {
  content: PublicContent;
};

export function FAQ({ content }: FAQProps) {
  const { faq } = content;

  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading">
      <div className="max-w-prose">
        <header className="layout-stack-sm layout-section-header">
          <p className="type-label">{faq.headingLabel}</p>
          <h2 id="faq-heading" className="type-heading">
            {faq.heading}
          </h2>
        </header>

        <dl className="layout-stack-md md:layout-stack-lg">
          {faq.items.map((item) => (
            <div
              key={item.question}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 md:pt-stack-md"
            >
              <dt>
                <h3 className="type-heading-sm">{item.question}</h3>
              </dt>
              <dd className="type-body mt-4 md:mt-5">
                {Array.isArray(item.answer) ? (
                  <div className="layout-stack-sm">
                    {item.answer.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  item.answer
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
