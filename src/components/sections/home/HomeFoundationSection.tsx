import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import {
  getPublishedCmsImageSrc,
  type CmsHtmlFields,
} from "@/lib/cms/published-field-html";
import type { PublicContent } from "@/content/i18n/types";
import { EmphasizedText } from "./shared";

type HomeFoundationSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

function FoundationIntro({
  html,
  parts,
}: {
  html?: string;
  parts: PublicContent["foundation"]["intro"];
}) {
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
    <EmphasizedText
      as="p"
      parts={parts}
      className="home-foundation-intro-text font-display"
    />
  );
}

function FoundationHeadline({
  html,
  parts,
}: {
  html?: string;
  parts: PublicContent["foundation"]["headline"];
}) {
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
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 ? <br /> : null}
          {part.bold ? <strong>{part.text}</strong> : part.text}
        </span>
      ))}
    </span>
  );
}

export function HomeFoundationSection({
  content,
  cmsHtmlFields = {},
}: HomeFoundationSectionProps) {
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
            <FoundationIntro
              html={cmsHtmlFields["foundation.intro"]}
              parts={content.foundation.intro}
            />
          </div>
          <h2 id="foundation-heading" className="home-foundation-headline">
            <FoundationHeadline
              html={cmsHtmlFields["foundation.headline"]}
              parts={content.foundation.headline}
            />
          </h2>
        </div>
        <div className="home-foundation-media">
          {imageSrc ? <img src={imageSrc} alt="" /> : null}
        </div>
      </div>
    </Section>
  );
}
