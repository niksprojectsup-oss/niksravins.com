import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";

const INTRO_FALLBACK =
  "Bring what is troubling you.\nWhat is holding you back. What you want to change.";

const HEADLINE_FALLBACK = "Together we look at\nwhat may be underneath it.";

export function HomeUnderneathSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  const imageSrc = getPublishedCmsImageSrc(cmsHtmlFields["underneath.image"]);

  return (
    <Section
      aria-labelledby="underneath-heading"
      className="home-underneath overflow-x-clip bg-transparent"
      containerClassName="home-underneath-container"
    >
      <div className="home-underneath-grid">
        <div className="home-underneath-media">
          {imageSrc ? <img src={imageSrc} alt="" /> : null}
        </div>
        <div className="home-underneath-copy">
          <div className="home-underneath-intro">
            <CmsPublishedFieldText
              html={cmsHtmlFields["underneath.intro"]}
              fallback={INTRO_FALLBACK}
              className="home-underneath-intro-text font-display"
            />
          </div>
          <h2 id="underneath-heading" className="home-underneath-headline">
            <CmsPublishedFieldText
              html={cmsHtmlFields["underneath.headline"]}
              fallback={HEADLINE_FALLBACK}
              className="home-underneath-headline-text font-display"
            />
          </h2>
        </div>
      </div>
    </Section>
  );
}
