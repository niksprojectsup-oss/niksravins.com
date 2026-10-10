import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";

type HomeUnderneathSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function HomeUnderneathSection({
  content,
  cmsHtmlFields = {},
}: HomeUnderneathSectionProps) {
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
              fallback={content.underneath.intro}
              className="home-underneath-intro-text font-display"
            />
          </div>
          <h2 id="underneath-heading" className="home-underneath-headline">
            <CmsPublishedFieldText
              html={cmsHtmlFields["underneath.headline"]}
              fallback={content.underneath.headline}
              className="home-underneath-headline-text font-display"
            />
          </h2>
        </div>
      </div>
    </Section>
  );
}
