import { flattenCmsParagraphField } from "@/content/cms/tiptap-blocks";
import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

type AAPMethodProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function AAPMethod({ content, cmsHtmlFields = {} }: AAPMethodProps) {
  const { aap, sectionLabels } = content;

  return (
    <Section id="aap" size="lg" aria-labelledby="aap-heading">
      <div className="max-w-wide">
        <header className="layout-stack-sm layout-section-header max-w-prose md:layout-stack-md">
          <p className="type-label">{sectionLabels.aapLabel}</p>
          <h2 id="aap-heading" className="type-heading">
            <CmsPublishedFieldText
              html={cmsHtmlFields["aap.title"]}
              fallback={aap.title}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </h2>
          <div className="type-editorial">
            <CmsPublishedFieldText
              html={cmsHtmlFields["aap.intro"]}
              fallback={flattenCmsParagraphField(aap.intro)}
              className={CMS_PUBLISHED_BLOCK_CLASS}
            />
          </div>
        </header>

        <ol className="layout-stack-md max-w-prose list-none md:layout-stack-lg">
          {aap.points.map((point, index) => (
            <li
              key={point.title}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 md:pt-stack-md"
            >
              <div className="layout-stack-sm">
                <span className="type-label text-ink-faint" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-heading-sm">
                  <CmsPublishedFieldText
                    html={cmsHtmlFields[`aap.points.${index}.title`]}
                    fallback={point.title}
                    className={CMS_PUBLISHED_INLINE_CLASS}
                  />
                </h3>
                <div className="type-body">
                  <CmsPublishedFieldText
                    html={cmsHtmlFields[`aap.points.${index}.description`]}
                    fallback={flattenCmsParagraphField(point.description)}
                    className={CMS_PUBLISHED_BLOCK_CLASS}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
