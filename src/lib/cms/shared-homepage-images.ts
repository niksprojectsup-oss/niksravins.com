import {
  CMS_LOCALES,
  getCmsPageDefinition,
  type CmsLocale,
  type CmsPageDefinition,
} from "@/lib/cms/definitions";
import type { CmsDraftItemWrite, CmsSectionRecord } from "@/lib/cms/draft-persistence";
import { tiptapImageDocument } from "@/lib/cms/import/tiptap-builders";
import { getCmsImageSrcFromDocument, normalizeCmsTiptapJson, tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

export type SharedHomepageImageItem = {
  sectionId: string;
  locale: string;
  fieldKey: string;
  draftJson: unknown;
  publishedJson: unknown;
  updatedAt: Date | string;
};

export type SharedHomepageImageMirror = {
  sectionId: string;
  locale: CmsLocale;
  fieldKey: string;
  draftJson: CmsTiptapJson;
  publishedJson: CmsTiptapJson;
  plainText: string | null;
};

const HOME_IMAGE_FIELD_KEYS = homepageImageFieldKeys();

export function homepageImageFieldKeys(
  definition: CmsPageDefinition | undefined = getCmsPageDefinition("home"),
): string[] {
  if (!definition || definition.slug !== "home") return [];

  return definition.sections.flatMap((section) =>
    section.fields.filter((field) => field.kind === "image").map((field) => field.key),
  );
}

export function isHomepageImageFieldKey(fieldKey: string): boolean {
  return HOME_IMAGE_FIELD_KEYS.includes(fieldKey);
}

export function getCmsImageAltFromDocument(value: CmsTiptapJson | null | undefined): string {
  if (!value) return "";

  const visit = (node: CmsTiptapJson): string | undefined => {
    if (node.type === "image" && typeof node.attrs?.alt === "string") {
      return node.attrs.alt;
    }

    for (const child of node.content ?? []) {
      const found = visit(child);
      if (found !== undefined) return found;
    }

    return undefined;
  };

  return visit(value) ?? "";
}

/** Replace the image file reference and keep every other attribute, including alt text. */
export function withCmsImageSrc(
  document: CmsTiptapJson | null | undefined,
  src: string,
): CmsTiptapJson {
  const normalized = normalizeCmsTiptapJson(document);
  if (!normalized) {
    return tiptapImageDocument(src, "");
  }

  let replaced = false;
  const visit = (node: CmsTiptapJson): CmsTiptapJson => {
    if (!replaced && node.type === "image") {
      replaced = true;
      return {
        ...node,
        attrs: {
          ...(node.attrs ?? {}),
          src,
        },
      };
    }

    if (!node.content) return node;
    return { ...node, content: node.content.map(visit) };
  };

  const next = visit(normalized);
  return replaced ? next : tiptapImageDocument(src, getCmsImageAltFromDocument(normalized));
}

function timestamp(value: Date | string): number {
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function localeRank(locale: string): number {
  const index = CMS_LOCALES.indexOf(locale as CmsLocale);
  return index === -1 ? CMS_LOCALES.length : index;
}

/**
 * Published pages use the newest published file. The editor also sees a newer
 * unsaved replacement from any locale. Alt text is never taken from that row.
 */
export function resolveSharedHomepageImageSrc(
  items: readonly SharedHomepageImageItem[],
  fieldKey: string,
  mode: "published" | "editor",
): string | undefined {
  if (!isHomepageImageFieldKey(fieldKey)) return undefined;

  const ranked = items
    .filter((item) => item.fieldKey === fieldKey)
    .map((item) => {
      const published = getCmsImageSrcFromDocument(normalizeCmsTiptapJson(item.publishedJson));
      const draft = getCmsImageSrcFromDocument(normalizeCmsTiptapJson(item.draftJson));
      const src = mode === "published" ? published : (draft ?? published);
      return src ? { src, updatedAt: timestamp(item.updatedAt), locale: item.locale } : null;
    })
    .filter((entry): entry is { src: string; updatedAt: number; locale: string } => Boolean(entry))
    .sort((left, right) => right.updatedAt - left.updatedAt || localeRank(left.locale) - localeRank(right.locale));

  return ranked[0]?.src;
}

export function applySharedHomepageImageDocument(
  document: CmsTiptapJson | null | undefined,
  src: string | undefined,
): CmsTiptapJson | null {
  if (!src) return normalizeCmsTiptapJson(document);
  if (getCmsImageSrcFromDocument(document) === src) {
    return normalizeCmsTiptapJson(document);
  }
  return withCmsImageSrc(document, src);
}

export function planSharedHomepageImageDraftWrites(input: {
  definition: CmsPageDefinition;
  sections: readonly CmsSectionRecord[];
  sourceLocale: CmsLocale;
  fields: Record<string, CmsTiptapJson | null>;
  existingItems: readonly SharedHomepageImageItem[];
  createId?: () => string;
}): CmsDraftItemWrite[] {
  if (input.definition.slug !== "home") return [];

  const createId = input.createId ?? (() => crypto.randomUUID());
  const sectionsByKey = new Map(input.sections.map((section) => [section.key, section]));
  const writes: CmsDraftItemWrite[] = [];

  for (const sectionDef of input.definition.sections) {
    const section = sectionsByKey.get(sectionDef.key);
    if (!section) continue;

    for (const field of sectionDef.fields) {
      if (field.kind !== "image" || !(field.key in input.fields)) continue;

      const src = getCmsImageSrcFromDocument(input.fields[field.key]);
      if (!src) continue;

      for (const locale of CMS_LOCALES) {
        if (locale === input.sourceLocale) continue;

        const existing = input.existingItems.find(
          (item) => item.sectionId === section.id && item.locale === locale && item.fieldKey === field.key,
        );
        const draft = normalizeCmsTiptapJson(existing?.draftJson);
        const published = normalizeCmsTiptapJson(existing?.publishedJson);
        const currentSrc =
          getCmsImageSrcFromDocument(draft) ?? getCmsImageSrcFromDocument(published);
        if (currentSrc === src) continue;

        const draftJson = withCmsImageSrc(draft ?? published, src);
        writes.push({
          id: createId(),
          sectionId: section.id,
          locale,
          fieldKey: field.key,
          draftJson: JSON.parse(JSON.stringify(draftJson)),
          plainText: tiptapJsonToPlainText(draftJson) || null,
        });
      }
    }
  }

  return writes;
}

export function planSharedHomepageImageMirrors(input: {
  definition: CmsPageDefinition;
  sourceLocale: CmsLocale;
  items: readonly SharedHomepageImageItem[];
}): SharedHomepageImageMirror[] {
  if (input.definition.slug !== "home") return [];

  const mirrors: SharedHomepageImageMirror[] = [];

  for (const fieldKey of homepageImageFieldKeys(input.definition)) {
    const source = input.items.find(
      (item) => item.locale === input.sourceLocale && item.fieldKey === fieldKey,
    );
    const src = getCmsImageSrcFromDocument(normalizeCmsTiptapJson(source?.draftJson));
    if (!source || !src) continue;

    for (const locale of CMS_LOCALES) {
      if (locale === input.sourceLocale) continue;

      const existing = input.items.find(
        (item) => item.sectionId === source.sectionId && item.locale === locale && item.fieldKey === fieldKey,
      );
      const draft = normalizeCmsTiptapJson(existing?.draftJson);
      const published = normalizeCmsTiptapJson(existing?.publishedJson);
      const draftSrc = getCmsImageSrcFromDocument(draft);
      const publishedSrc = getCmsImageSrcFromDocument(published);
      if (draftSrc === src && publishedSrc === src) continue;

      const draftJson = withCmsImageSrc(draft ?? published, src);
      const publishedJson = withCmsImageSrc(published ?? draft, src);
      mirrors.push({
        sectionId: source.sectionId,
        locale,
        fieldKey,
        draftJson,
        publishedJson,
        plainText: tiptapJsonToPlainText(publishedJson) || null,
      });
    }
  }

  return mirrors;
}
