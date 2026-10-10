import type { CmsContentItem } from "@prisma/client";
import {
  ADMIN_EDITABLE_CMS_PAGE_SLUGS,
  CMS_LOCALES,
  getCmsPageDefinition,
  isAdminEditableCmsPageSlug,
  isCmsLocale,
  type CmsLocale,
} from "@/lib/cms/definitions";
import type { CmsPublishedPageContent } from "@/lib/cms/published-page-content";
import { getCmsPageRecordBySlug } from "@/lib/cms/repository";
import { hasCmsTiptapContent, normalizeCmsTiptapJson, tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsPublishedFieldMap, CmsTiptapJson } from "@/lib/cms/types";
import type { Role } from "@/lib/security/types";
import { requireDatabase } from "@/lib/db/prisma";

export const CMS_PREVIEW_PAGE_SLUGS = ADMIN_EDITABLE_CMS_PAGE_SLUGS;

export type CmsPreviewPageSlug = (typeof CMS_PREVIEW_PAGE_SLUGS)[number];

export type CmsPreviewRequest =
  | { ok: true; slug: CmsPreviewPageSlug; locale: CmsLocale }
  | { ok: false; reason: "not_found" | "unsupported_locale" };

export function assertCanPreviewCmsContent(role?: Role): void {
  if (role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export function isCmsPreviewPageSlug(slug: string): slug is CmsPreviewPageSlug {
  return isAdminEditableCmsPageSlug(slug);
}

export function parseCmsPreviewRequest(input: {
  slug: string;
  locale?: string;
}): CmsPreviewRequest {
  if (!isCmsPreviewPageSlug(input.slug)) {
    return { ok: false, reason: "not_found" };
  }

  const locale = input.locale ?? "en";
  if (!isCmsLocale(locale)) {
    return { ok: false, reason: "unsupported_locale" };
  }

  return { ok: true, slug: input.slug, locale };
}

export function cmsPreviewPath(slug: CmsPreviewPageSlug, locale: CmsLocale): string {
  return `/admin/content/${slug}/preview?locale=${locale}`;
}

export function cmsPreviewEditorPath(slug: CmsPreviewPageSlug, locale: CmsLocale): string {
  return `/admin/content/${slug}?locale=${locale}`;
}

function resolvePreviewDocument(item: CmsContentItem | undefined): CmsTiptapJson | null {
  if (!item || item.locale === undefined) return null;

  if (hasCmsTiptapContent(item.draftJson)) {
    return normalizeCmsTiptapJson(item.draftJson);
  }

  if (hasCmsTiptapContent(item.publishedJson)) {
    return normalizeCmsTiptapJson(item.publishedJson);
  }

  return null;
}

export function buildPreviewCmsPageFields(input: {
  items: CmsContentItem[];
  locale: CmsLocale;
  fieldKeys: readonly string[];
}): Record<string, CmsTiptapJson> {
  const fields: Record<string, CmsTiptapJson> = {};

  for (const fieldKey of input.fieldKeys) {
    const item = input.items.find(
      (entry) => entry.locale === input.locale && entry.fieldKey === fieldKey,
    );
    const document = resolvePreviewDocument(item);
    if (document) {
      fields[fieldKey] = document;
    }
  }

  return fields;
}

export function previewFieldsToPlainTextMap(
  fields: Record<string, CmsTiptapJson>,
): CmsPublishedFieldMap {
  const plain: CmsPublishedFieldMap = {};
  for (const [fieldKey, document] of Object.entries(fields)) {
    const text = tiptapJsonToPlainText(document).trim();
    if (text) {
      plain[fieldKey] = text;
    }
  }
  return plain;
}

export async function getPreviewCmsPageContent(
  slug: string,
  locale: CmsLocale,
): Promise<CmsPublishedPageContent | null> {
  requireDatabase();

  if (!isCmsLocale(locale)) {
    return null;
  }

  const definition = getCmsPageDefinition(slug);
  const page = await getCmsPageRecordBySlug(slug);
  if (!definition || !page) {
    return null;
  }

  const fieldKeys = definition.sections.flatMap((section) =>
    section.fields.map((field) => field.key),
  );
  const items = page.sections.flatMap((section) => section.items);
  const fields = buildPreviewCmsPageFields({
    items,
    locale,
    fieldKeys,
  });

  return {
    slug: page.slug,
    title: page.title,
    locale,
    fields,
  };
}

export const CMS_PREVIEW_LOCALES = CMS_LOCALES;
