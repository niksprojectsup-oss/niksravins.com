import type { CmsContentItem, CmsPage } from "@prisma/client";
import {
  type CmsLocale,
  getCmsPageDefinition,
  isCmsLocale,
} from "@/lib/cms/definitions";
import { getCmsPageRecordBySlug } from "@/lib/cms/repository";
import { normalizeCmsTiptapJson, tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { requireDatabase } from "@/lib/db/prisma";

export const STANDALONE_CMS_PAGE_SLUGS = ["aap", "about", "faq", "contact", "legal"] as const;

export type StandaloneCmsPageSlug = (typeof STANDALONE_CMS_PAGE_SLUGS)[number];

export function isStandaloneCmsPageSlug(slug: string): slug is StandaloneCmsPageSlug {
  return STANDALONE_CMS_PAGE_SLUGS.includes(slug as StandaloneCmsPageSlug);
}

export type CmsPublishedPageField = {
  fieldKey: string;
  publishedJson: CmsTiptapJson;
};

export type CmsPublishedPageContent = {
  slug: string;
  title: string;
  locale: CmsLocale;
  fields: Record<string, CmsTiptapJson>;
};

function hasPublishedTiptapContent(value: unknown): value is CmsTiptapJson {
  const normalized = normalizeCmsTiptapJson(value);
  return Boolean(normalized && tiptapJsonToPlainText(normalized).trim());
}

export function buildPublishedCmsPageFields(input: {
  page: Pick<CmsPage, "status">;
  items: CmsContentItem[];
  locale: CmsLocale;
  fieldKeys: readonly string[];
}): Record<string, CmsTiptapJson> {
  if (input.page.status !== "PUBLISHED") {
    return {};
  }

  const fields: Record<string, CmsTiptapJson> = {};

  for (const fieldKey of input.fieldKeys) {
    const item = input.items.find(
      (entry) => entry.locale === input.locale && entry.fieldKey === fieldKey,
    );
    if (!item?.publishedJson || !hasPublishedTiptapContent(item.publishedJson)) {
      continue;
    }

    fields[fieldKey] = normalizeCmsTiptapJson(item.publishedJson)!;
  }

  return fields;
}

export async function getPublishedCmsPageContent(
  slug: string,
  locale: CmsLocale,
): Promise<CmsPublishedPageContent | null> {
  requireDatabase();

  if (!isCmsLocale(locale)) {
    return null;
  }

  const definition = getCmsPageDefinition(slug);
  const page = await getCmsPageRecordBySlug(slug);

  if (!definition || !page || page.status !== "PUBLISHED") {
    return null;
  }

  const fieldKeys = definition.sections.flatMap((section) => section.fields.map((field) => field.key));
  const items = page.sections.flatMap((section) => section.items);
  const fields = buildPublishedCmsPageFields({
    page,
    items,
    locale,
    fieldKeys,
  });

  if (Object.keys(fields).length === 0) {
    return null;
  }

  return {
    slug: page.slug,
    title: page.title,
    locale,
    fields,
  };
}
