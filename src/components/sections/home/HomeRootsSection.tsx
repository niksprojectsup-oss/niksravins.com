import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";

type HomeRootsSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function HomeRootsSection({
  content,
  cmsHtmlFields = {},
}: HomeRootsSectionProps) {
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
              fallback={content.roots.intro}
              className="home-roots-intro-text font-display"
            />
          </div>
          <h2 id="roots-heading" className="home-roots-headline">
            <CmsPublishedFieldText
              html={cmsHtmlFields["roots.headline"]}
              fallback={content.roots.headline}
              className="home-roots-headline-text font-display"
            />
          </h2>
        </div>
      </div>
    </Section>
  );
}
