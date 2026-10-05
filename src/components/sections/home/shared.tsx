import { enContent } from "@/content/i18n/en";
import type { HomeNarrative, PublicContent } from "@/content/i18n/types";
import { CMS_PUBLISHED_BLOCK_CLASS, CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

export type HomeSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function homeNarrative(content: PublicContent): HomeNarrative {
  return content.narrative ?? enContent.narrative!;
}

export function PublishedParagraphs({
  html,
  fallback,
}: {
  html?: string;
  fallback: string | readonly string[];
}) {
  if (html) {
    return (
      <CmsPublishedFieldText
        html={html}
        fallback={typeof fallback === "string" ? fallback : fallback.join("\n\n")}
        className={CMS_PUBLISHED_BLOCK_CLASS}
      />
    );
  }

  const paragraphs = typeof fallback === "string" ? [fallback] : fallback;

  return (
    <div className="home-prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="type-body">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
