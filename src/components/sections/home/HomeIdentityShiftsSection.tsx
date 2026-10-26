import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";

type HomeIdentityShiftsSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function HomeIdentityShiftsSection({
  content,
  cmsHtmlFields = {},
}: HomeIdentityShiftsSectionProps) {
  return (
    <Section
      id="identity-shifts"
      aria-labelledby="identity-shifts-heading"
      className="home-identity overflow-x-clip bg-transparent"
      containerClassName="home-identity-container"
    >
      <header className="home-identity-intro">
        <h2 id="identity-shifts-heading" className="home-identity-heading">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.heading"]}
            fallback={content.identityShifts.heading}
            className="home-identity-heading-text font-display"
          />
        </h2>
        <div className="home-identity-lede">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.intro"]}
            fallback={content.identityShifts.intro}
            className="home-identity-lede-text font-display"
          />
        </div>
      </header>

      <div className="home-identity-list">
        {content.identityShifts.rows.map((row, index) => (
          <article key={`${index}-${row.from}`} className="home-identity-row">
            <div className="home-identity-from">
              <CmsPublishedFieldText
                html={cmsHtmlFields[`identityShifts.rows.${index}.from`]}
                fallback={row.from}
                className="home-identity-belief-text font-display"
              />
            </div>
            <span className="home-identity-arrow home-identity-arrow-start" aria-hidden="true">
              →
            </span>
            <div className="home-identity-body">
              <CmsPublishedFieldText
                html={cmsHtmlFields[`identityShifts.rows.${index}.explanation`]}
                fallback={row.explanation}
                className="home-identity-body-text font-display"
              />
            </div>
            <span className="home-identity-arrow home-identity-arrow-end" aria-hidden="true">
              →
            </span>
            <div className="home-identity-to">
              <CmsPublishedFieldText
                html={cmsHtmlFields[`identityShifts.rows.${index}.to`]}
                fallback={row.to}
                className="home-identity-belief-text font-display"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="home-identity-close">
        <div className="home-identity-close-lead">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.closingLead"]}
            fallback={content.identityShifts.closingLead}
            className="home-identity-close-lead-text font-display"
          />
        </div>
        <div className="home-identity-close-copy">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.closing"]}
            fallback={content.identityShifts.closing}
            className="home-identity-close-copy-text font-display"
          />
        </div>
      </div>
    </Section>
  );
}
