import { trust } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function Trust() {
  return (
    <Section size="md" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-prose border-y border-border-subtle py-section-sm">
        <h2 id="trust-heading" className="sr-only">
          Understanding emotional patterns
        </h2>
        <p className="type-lead text-center text-ink-muted">{trust.text}</p>
      </div>
    </Section>
  );
}
