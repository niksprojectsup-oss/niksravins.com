import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";

function FoundationIntro({ html }: { html?: string }) {
  if (html) {
    return (
      <CmsPublishedFieldText
        html={html}
        fallback=""
        className="home-foundation-intro-text font-display"
      />
    );
  }

  return (
    <p className="home-foundation-intro-text font-display">
      I work with the <strong>deeper emotional connections</strong> and <strong>beliefs</strong> that
      shape how you <strong>experience yourself</strong>, what you believe <strong>you deserve</strong>,
      and what feels <strong>possible for you</strong>.
    </p>
  );
}

function FoundationHeadline({ html }: { html?: string }) {
  if (html) {
    return (
      <CmsPublishedFieldText
        html={html}
        fallback=""
        className="home-foundation-headline-text font-display"
      />
    );
  }

  return (
    <span className="home-foundation-headline-text font-display">
      Change the inner foundation.
      <br />
      <strong>Create space for a different life.</strong>
    </span>
  );
}

export function HomeFoundationSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  const imageSrc = getPublishedCmsImageSrc(cmsHtmlFields["foundation.image"]);

  return (
    <Section
      aria-labelledby="foundation-heading"
      className="home-foundation overflow-x-clip bg-transparent"
      containerClassName="home-foundation-container"
    >
      <div className="home-foundation-grid">
        <div className="home-foundation-copy">
          <div className="home-foundation-intro">
            <FoundationIntro html={cmsHtmlFields["foundation.intro"]} />
          </div>
          <h2 id="foundation-heading" className="home-foundation-headline">
            <FoundationHeadline html={cmsHtmlFields["foundation.headline"]} />
          </h2>
        </div>
        <div className="home-foundation-media">
          {imageSrc ? <img src={imageSrc} alt="" /> : null}
        </div>
      </div>
    </Section>
  );
}
