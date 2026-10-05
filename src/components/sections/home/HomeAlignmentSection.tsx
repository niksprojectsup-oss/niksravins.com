import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";

const ALIGNMENT_ITEMS = [
  {
    title: "Your relationship.",
    body: "You want to feel more connected, safe, loved or free in your relationship — but something keeps getting in the way.",
  },
  {
    title: "Your work.",
    body: "You hate your job. You want something different. You know you’re capable of more and deserve better, but something keeps you where you are.",
  },
  {
    title: "Your confidence.",
    body: "You want to speak up, be seen, trust yourself and take up space without constantly questioning yourself.",
  },
  {
    title: "Your relationship with yourself.",
    body: "You’re tired of doubting yourself, feeling like you’re not enough or constantly needing to prove your worth.",
  },
  {
    title: "Your dreams.",
    body: "There are things you want to create, experience or achieve — but you keep holding yourself back, postponing or staying in what feels familiar.",
  },
  {
    title: "Your life.",
    body: "You feel stuck, disconnected or like something is missing. You know you want more, but you haven’t found the way forward yet.",
  },
] as const;

export function HomeAlignmentSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  return (
    <Section
      aria-labelledby="alignment-heading"
      className="home-alignment overflow-x-clip bg-transparent"
      containerClassName="home-alignment-container"
    >
      <div className="home-alignment-inner">
        <h2 id="alignment-heading" className="home-alignment-heading font-display">
          What feels out of alignment?
        </h2>
        <div className="home-alignment-grid">
          {ALIGNMENT_ITEMS.map((item, index) => {
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
