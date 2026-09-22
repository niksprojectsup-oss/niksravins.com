import { getCmsPageDefinition, type CmsFieldDefinition } from "@/lib/cms/definitions";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";

export type CmsPublishedFieldVariant = "inline" | "block";

export type CmsHtmlFields = Record<string, string>;

function tiptapJsonToInlineHtml(value: CmsTiptapJson): string {
  const html = tiptapJsonToHtml(value).trim();
  const singleParagraphMatch = html.match(/^<p[^>]*>([\s\S]*)<\/p>$/);

  if (singleParagraphMatch && !singleParagraphMatch[1].includes("<p")) {
    return singleParagraphMatch[1];
  }

  return html;
}

function resolveHomeFieldVariant(field: CmsFieldDefinition): CmsPublishedFieldVariant {
  if (field.kind === "paragraphs" || field.kind === "faq-answer") {
    return "block";
  }

  return "inline";
}

export function getPublishedCmsFieldHtml(
  fields: Record<string, CmsTiptapJson> | undefined,
  fieldKey: string,
  variant: CmsPublishedFieldVariant = "block",
): string | undefined {
  const document = fields?.[fieldKey];
  if (!document) {
    return undefined;
  }

  const html = variant === "inline" ? tiptapJsonToInlineHtml(document) : tiptapJsonToHtml(document);
  const trimmed = html.trim();
  return trimmed || undefined;
}

export function buildPublishedCmsHtmlFields(
  fields: Record<string, CmsTiptapJson>,
): CmsHtmlFields {
  const definition = getCmsPageDefinition("home");
  if (!definition) {
    return {};
  }

  const htmlFields: CmsHtmlFields = {};

  for (const section of definition.sections) {
    if (section.key === "seo") {
      continue;
    }

    for (const field of section.fields) {
      const html = getPublishedCmsFieldHtml(fields, field.key, resolveHomeFieldVariant(field));
      if (html) {
        htmlFields[field.key] = html;
      }
    }
  }

  return htmlFields;
}
