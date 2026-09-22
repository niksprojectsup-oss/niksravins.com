import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type CmsPublishedBodyProps = {
  document: CmsTiptapJson;
  className?: string;
};

const CMS_PUBLISHED_CONTENT_CLASS =
  "cms-published-content max-w-prose layout-stack-sm md:layout-stack-md [&_h1]:type-heading [&_h2]:type-heading-sm [&_h3]:type-heading-sm [&_h3]:font-medium [&_p]:type-body [&_p]:text-ink [&_strong]:font-medium [&_em]:italic [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-4 [&_blockquote]:text-ink-subtle [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:type-body [&_a]:text-accent [&_a]:underline [&_hr]:border-border-subtle";

export function CmsPublishedBody({ document, className }: CmsPublishedBodyProps) {
  const html = tiptapJsonToHtml(document);

  if (!html.trim()) {
    return null;
  }

  return (
    <div
      className={cn(CMS_PUBLISHED_CONTENT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
