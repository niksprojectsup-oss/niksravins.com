export const CMS_PUBLISHED_INLINE_CLASS =
  "[&_strong]:font-medium [&_em]:italic [&_s]:line-through [&_a]:text-accent [&_a]:underline";

export const CMS_PUBLISHED_BLOCK_CLASS =
  "cms-published-inline [&_p]:type-body [&_p]:text-inherit [&_p+p]:mt-4 [&_h1]:type-heading-sm [&_h2]:type-heading-sm [&_h3]:type-heading-sm [&_h3]:font-medium [&_strong]:font-medium [&_em]:italic [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline";

type CmsPublishedFieldTextProps = {
  html?: string;
  fallback: string;
  className?: string;
};

export function CmsPublishedFieldText({ html, fallback, className }: CmsPublishedFieldTextProps) {
  if (html) {
    return (
      <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return <span className={className}>{fallback}</span>;
}
