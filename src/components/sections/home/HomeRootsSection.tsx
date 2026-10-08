import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";

const INTRO_FALLBACK =
  "We work with the beliefs and emotional associations underneath it — the ones that can shape your choices, behaviour, relationships and the way you experience yourself.";

const HEADLINE_FALLBACK =
  "When the inner foundation changes,\nthe way you move through life can change with it.";

export function HomeRootsSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  const imageSrc = getPublishedCmsImageSrc(cmsHtmlFields["roots.image"]);

  return (
    <Section
      aria-labelledby="roots-heading"
      className="home-roots overflow-x-clip bg-transparent"
      containerClassName="home-roots-container"
    >
      <div className="home-roots-grid">
        <div className="home-roots-media">
          {imageSrc ? <img src={imageSrc} alt="" /> : null}
        </div>
        <div className="home-roots-copy">
          <div className="home-roots-intro">
            <CmsPublishedFieldText
              html={cmsHtmlFields["roots.intro"]}
              fallback={INTRO_FALLBACK}
              className="home-roots-intro-text font-display"
            />
          </div>
          <h2 id="roots-heading" className="home-roots-headline">
            <CmsPublishedFieldText
              html={cmsHtmlFields["roots.headline"]}
              fallback={HEADLINE_FALLBACK}
              className="home-roots-headline-text font-display"
            />
          </h2>
        </div>
      </div>
    </Section>
  );
}
