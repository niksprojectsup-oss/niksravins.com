import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";

type HomeAlignmentSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function HomeAlignmentSection({
  content,
  cmsHtmlFields = {},
}: HomeAlignmentSectionProps) {
  return (
    <Section
      aria-labelledby="alignment-heading"
      className="home-alignment overflow-x-clip bg-transparent"
      containerClassName="home-alignment-container"
    >
      <div className="home-alignment-inner">
        <h2 id="alignment-heading" className="home-alignment-heading font-display">
          {content.alignment.heading}
        </h2>
        <div className="home-alignment-grid">
          {content.alignment.items.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            const imageSrc = getPublishedCmsImageSrc(cmsHtmlFields[`alignment.${index}.image`]);
            const titleHtml = cmsHtmlFields[`alignment.${index}.title`];
            const bodyHtml = cmsHtmlFields[`alignment.${index}.body`];

            return (
              <article
                key={number}
                className="home-alignment-item"
                data-stage={number}
              >
                <div className="home-alignment-media">
                  {imageSrc ? (
                    <img src={imageSrc} alt="" />
                  ) : null}
                  <div className="home-alignment-panel">
                    <span className="home-alignment-num font-display">{number}</span>
                    <span className="home-alignment-rule" aria-hidden="true" />
                    <p className="home-alignment-item-title">
                      <CmsPublishedFieldText
                        html={titleHtml}
                        fallback={item.title}
                        className="home-alignment-item-title-text font-display"
                      />
                    </p>
                    <div className="home-alignment-item-body">
                      <CmsPublishedFieldText
                        html={bodyHtml}
                        fallback={item.body}
                        className="home-alignment-item-body-text font-display"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
