import type { EmphasizedRun, PublicContent } from "@/content/i18n/types";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

export type HomeSectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

export function EmphasizedText({
  parts,
  as: Tag = "span",
  className,
}: {
  parts: readonly EmphasizedRun[];
  as?: "span" | "p";
  className?: string;
}) {
  return (
    <Tag className={className}>
      {parts.map((part, index) =>
        part.bold ? <strong key={index}>{part.text}</strong> : part.text,
      )}
    </Tag>
  );
}
