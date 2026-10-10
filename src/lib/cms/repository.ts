import type { CmsContentItem, CmsPage, CmsSection } from "@prisma/client";
import {
  CMS_LOCALES,
  type CmsLocale,
  getCmsPageDefinition,
  isCmsLocale,
} from "@/lib/cms/definitions";
import {
  buildCmsDraftSaveQuery,
  buildCmsPublishQuery,
  missingCmsSectionKeys,
  planCmsDraftItemWrites,
  planCmsPublishItemIds,
} from "@/lib/cms/draft-persistence";
import { hasCmsTiptapContent, normalizeCmsTiptapJson, tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type {
  CmsPageContent,
  CmsPageStatus,
  CmsPageSummary,
  CmsPublishedFieldMap,
  CmsSectionContent,
  CmsTiptapJson,
} from "@/lib/cms/types";
import { prisma, requireDatabase } from "@/lib/db/prisma";

type SectionWithItems = CmsSection & { items: CmsContentItem[] };
type PageWithSections = CmsPage & { sections: SectionWithItems[] };

function mapPageStatus(status: CmsPage["status"]): CmsPageStatus {
  return status;
}

function mapItemValue(item: CmsContentItem): {
  fieldKey: string;
  draftJson: CmsTiptapJson | null;
  publishedJson: CmsTiptapJson | null;
  plainText: string | null;
  updatedAt: string;
} {
  return {
    fieldKey: item.fieldKey,
    draftJson: normalizeCmsTiptapJson(item.draftJson),
    publishedJson: normalizeCmsTiptapJson(item.publishedJson),
    plainText: item.plainText,
    updatedAt: item.updatedAt.toISOString(),
  };
}

function buildSectionContent(
  section: SectionWithItems,
  locale: CmsLocale,
  definitionFields: readonly { key: string; label: string }[],
): CmsSectionContent {
  const itemsByField = new Map(section.items.filter((item) => item.locale === locale).map((item) => [item.fieldKey, item]));

  return {
    key: section.key,
    title: section.title,
    sortOrder: section.sortOrder,
    fields: definitionFields.map((field) => {
      const item = itemsByField.get(field.key);
      return item
        ? mapItemValue(item)
        : {
            fieldKey: field.key,
            draftJson: null,
            publishedJson: null,
            plainText: null,
            updatedAt: section.updatedAt.toISOString(),
          };
    }),
  };
}

export async function listCmsPages(): Promise<CmsPageSummary[]> {
  requireDatabase();
  const pages = await prisma.cmsPage.findMany({
    include: {
      sections: {
        include: { items: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });

  return pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: mapPageStatus(page.status),
    updatedAt: page.updatedAt.toISOString(),
    locales: [...CMS_LOCALES],
  }));
}

export async function getCmsPageRecordBySlug(slug: string): Promise<PageWithSections | null> {
  requireDatabase();
  return prisma.cmsPage.findUnique({
    where: { slug },
    include: {
      sections: {
        include: { items: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getAdminPageContent(
  pageSlug: string,
  locale: CmsLocale,
): Promise<CmsPageContent | null> {
  requireDatabase();
  const definition = getCmsPageDefinition(pageSlug);
  const page = await getCmsPageRecordBySlug(pageSlug);
  if (!definition || !page) return null;

  const content: CmsPageContent = {
    slug: page.slug,
    title: page.title,
    status: mapPageStatus(page.status),
    locale,
    updatedAt: page.updatedAt.toISOString(),
    sections: definition.sections.map((sectionDef) => {
      const section = page.sections.find((entry) => entry.key === sectionDef.key);
      if (!section) {
        return {
          key: sectionDef.key,
          title: sectionDef.title,
          sortOrder: sectionDef.sortOrder,
          fields: sectionDef.fields.map((field) => ({
            fieldKey: field.key,
            draftJson: null,
            publishedJson: null,
            plainText: null,
            updatedAt: page.updatedAt.toISOString(),
          })),
        };
      }

      return buildSectionContent(section, locale, sectionDef.fields);
    }),
  };

  return content;
}

export function buildPublishedFieldMap(
  page: Pick<CmsPage, "status">,
  items: CmsContentItem[],
  locale: CmsLocale,
): CmsPublishedFieldMap {
  if (page.status !== "PUBLISHED") {
    return {};
  }

  const fields: CmsPublishedFieldMap = {};

  for (const item of items) {
    if (item.locale !== locale || !item.publishedJson) continue;
    const plainText = item.plainText ?? tiptapJsonToPlainText(item.publishedJson as CmsTiptapJson);
    if (plainText) {
      fields[item.fieldKey] = plainText;
    }
  }

  return fields;
}

export async function getPublishedPageContent(
  pageSlug: string,
  locale: CmsLocale,
): Promise<CmsPublishedFieldMap> {
  requireDatabase();
  const page = await getCmsPageRecordBySlug(pageSlug);
  if (!page) return {};

  const items = page.sections.flatMap((section) => section.items);
  return buildPublishedFieldMap(page, items, locale);
}

export async function saveContentDraft(input: {
  pageSlug: string;
  locale: CmsLocale;
  fields: Record<string, CmsTiptapJson | null>;
}): Promise<void> {
  requireDatabase();
  const page = await getCmsPageRecordBySlug(input.pageSlug);
  if (!page) {
    throw new Error("CMS page not found.");
  }

  const definition = getCmsPageDefinition(input.pageSlug);
  if (!definition) {
    throw new Error("CMS page definition not found.");
  }

  let sections = page.sections;
  const missingSectionKeys = missingCmsSectionKeys(definition, sections);

  if (missingSectionKeys.length > 0) {
    await prisma.cmsSection.createMany({
      data: definition.sections
        .filter((section) => missingSectionKeys.includes(section.key))
        .map((section) => ({
          pageId: page.id,
          key: section.key,
          title: section.title,
          sortOrder: section.sortOrder,
        })),
      skipDuplicates: true,
    });

    const refreshed = await getCmsPageRecordBySlug(input.pageSlug);
    if (!refreshed) {
      throw new Error("CMS page not found.");
    }
    sections = refreshed.sections;
  }

  const writes = planCmsDraftItemWrites({
    sections,
    definition,
    locale: input.locale,
    fields: input.fields,
  });

  if (writes.length === 0) {
    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { updatedAt: new Date() },
    });
    return;
  }

  await prisma.$executeRaw(buildCmsDraftSaveQuery(page.id, writes));
}

export async function publishContent(input: {
  pageSlug: string;
  locale: CmsLocale;
}): Promise<void> {
  requireDatabase();
  const page = await getCmsPageRecordBySlug(input.pageSlug);
  if (!page) {
    throw new Error("CMS page not found.");
  }

  const itemIds = planCmsPublishItemIds(
    page.sections.flatMap((section) => section.items),
    input.locale,
  );

  await prisma.$executeRaw(buildCmsPublishQuery(page.id, itemIds));
}

export function assertCmsLocale(value: string): CmsLocale {
  if (!isCmsLocale(value)) {
    throw new Error("Unsupported CMS locale.");
  }
  return value;
}

export async function getPreviewPageContent(
  pageSlug: string,
  locale: CmsLocale,
): Promise<CmsPublishedFieldMap> {
  requireDatabase();
  const adminContent = await getAdminPageContent(pageSlug, locale);
  if (!adminContent || adminContent.locale !== locale) return {};

  const fields: CmsPublishedFieldMap = {};
  for (const section of adminContent.sections) {
    for (const field of section.fields) {
      const source = hasCmsTiptapContent(field.draftJson)
        ? field.draftJson
        : hasCmsTiptapContent(field.publishedJson)
          ? field.publishedJson
          : null;
      const plainText = source ? tiptapJsonToPlainText(source) : null;
      if (plainText?.trim()) {
        fields[field.fieldKey] = plainText;
      }
    }
  }
  return fields;
}
