import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";

const ALIGNMENT_ITEMS = [
  { title: "Your relationship.", body: "Your relationship" },
  { title: "Your work.", body: "Your work" },
  { title: "Your confidence.", body: "Your confidence" },
  { title: "Your relationship with yourself.", body: "Your relationship with yourself" },
  { title: "Your dreams.", body: "Your dreams" },
  { title: "Your life.", body: "Your life" },
] as const;

export function HomeAlignmentSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  return (
    <Section aria-labelledby="alignment-heading" className="alignment">
      <div className="alignment-inner">
        <h2 id="alignment-heading" className="alignment-heading">
          What feels out of alignment?
        </h2>
        <div className="alignment-grid">
          {ALIGNMENT_ITEMS.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            const imageSrc = getPublishedCmsImageSrc(cmsHtmlFields[`alignment.${index}.image`]);
            const titleHtml = cmsHtmlFields[`alignment.${index}.title`];
            const bodyHtml = cmsHtmlFields[`alignment.${index}.body`];

            return (
              <article key={number} className="alignment-item" data-stage={number}>
                <div className="alignment-media">
                  {imageSrc ? <img src={imageSrc} alt="" /> : null}
                  <div className="alignment-panel">
                    <span className="alignment-num">{number}</span>
                    <span className="alignment-rule" aria-hidden="true" />
                    <div className="alignment-copy">
                      <p className="alignment-item-title">
                        <CmsPublishedFieldText
                          html={titleHtml}
                          fallback={item.title}
                          className="alignment-item-title-text"
                        />
                      </p>
                      <div className="alignment-item-body">
                        <CmsPublishedFieldText
                          html={bodyHtml}
                          fallback={item.body}
                          className="alignment-item-body-text"
                        />
                      </div>
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
