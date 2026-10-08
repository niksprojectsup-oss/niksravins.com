import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

const HEADING_FALLBACK = "Change at the level of identity";

const INTRO_FALLBACK =
  "Sometimes what holds you back isn’t the situation itself, but what you believe about who you are and what is safe, possible or deserved for you.";

const CLOSING_LEAD_FALLBACK = "These beliefs don’t always sound like thoughts in your head.";

const CLOSING_FALLBACK =
  "Sometimes they show up as the choices you make, the relationships you stay in, the things you avoid, or the life you don’t allow yourself to have.";

const ROWS = [
  {
    from: "I’m not good enough.",
    explanation:
      "You may constantly prove yourself, compare yourself to others or hold back from opportunities, relationships and experiences you actually want.",
    to: "I am enough.",
  },
  {
    from: "I don’t deserve better.",
    explanation:
      "You may stay in a job, relationship or situation that no longer feels right — even when you know you want more.",
    to: "I deserve better.",
  },
  {
    from: "It’s safer to stay where I am.",
    explanation:
      "You may keep choosing what is familiar instead of taking the risk of moving towards what you really want.",
    to: "I can choose differently.",
  },
  {
    from: "I can’t trust people.",
    explanation:
      "You may struggle to open up, receive support or fully let someone close — even when you deeply want connection.",
    to: "I can trust.",
  },
  {
    from: "I have to do everything myself.",
    explanation:
      "You may find it difficult to receive, relax or let someone else take care of things. Even when you want more ease, softness and space, you keep taking control and carrying everything yourself.",
    to: "I can trust and allow.",
  },
  {
    from: "I’m too much.",
    explanation:
      "You may make yourself smaller, hide your needs or hold back parts of yourself to avoid rejection.",
    to: "I am allowed to be fully myself.",
  },
] as const;

export function HomeIdentityShiftsSection({
  cmsHtmlFields = {},
}: {
  cmsHtmlFields?: CmsHtmlFields;
}) {
  return (
    <Section
      aria-labelledby="identity-shifts-heading"
      className="home-identity overflow-x-clip bg-transparent"
      containerClassName="home-identity-container"
    >
      <header className="home-identity-intro">
        <h2 id="identity-shifts-heading" className="home-identity-heading">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.heading"]}
            fallback={HEADING_FALLBACK}
            className="home-identity-heading-text font-display"
          />
        </h2>
        <div className="home-identity-lede">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.intro"]}
            fallback={INTRO_FALLBACK}
            className="home-identity-lede-text font-display"
          />
        </div>
      </header>

      <div className="home-identity-list">
        {ROWS.map((row, index) => (
          <article key={row.from} className="home-identity-row">
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
            fallback={CLOSING_LEAD_FALLBACK}
            className="home-identity-close-lead-text font-display"
          />
        </div>
        <div className="home-identity-close-copy">
          <CmsPublishedFieldText
            html={cmsHtmlFields["identityShifts.closing"]}
            fallback={CLOSING_FALLBACK}
            className="home-identity-close-copy-text font-display"
          />
        </div>
      </div>
    </Section>
  );
}
