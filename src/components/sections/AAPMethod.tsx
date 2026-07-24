import { aap } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function AAPMethod() {
  return (
    <Section id="aap" size="lg" aria-labelledby="aap-heading">
      <div className="layout-stack-xl max-w-wide">
        <header className="layout-stack-md max-w-prose">
          <p className="type-label">AAP</p>
          <h2 id="aap-heading" className="type-heading">
            {aap.title}
          </h2>
          <p className="type-editorial">{aap.intro}</p>
        </header>

        <ol className="layout-stack-lg max-w-prose list-none">
          {aap.points.map((point, index) => (
            <li
              key={point.title}
              className="border-t border-border-subtle pt-stack-md first:border-t-0 first:pt-0"
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
