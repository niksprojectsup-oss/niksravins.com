import {
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import { PublishedParagraphs, type HomeSectionProps } from "./shared";

export function HomeUnderneathSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { about, hero } = content;
  const trunk = about.story[0];
  const practice = about.story[2];

  return (
    <Section size="lg" aria-labelledby="underneath-heading" className="home-band">
      <div className="home-copy home-copy-offset">
        <h2 id="underneath-heading" className="type-home-title">
          <CmsPublishedFieldText
            html={cmsHtmlFields["about.title"]}
            fallback={about.title}
            className={CMS_PUBLISHED_INLINE_CLASS}
          />
        </h2>
        <PublishedParagraphs fallback={hero.explanation.slice(1)} />
        {trunk ? (
          <PublishedParagraphs html={cmsHtmlFields["about.story.0"]} fallback={trunk} />
        ) : null}
        {practice ? (
          <PublishedParagraphs html={cmsHtmlFields["about.story.2"]} fallback={practice} />
        ) : null}
      </div>
    </Section>
  );
}
