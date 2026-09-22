import type { CmsContentItem, Prisma, PrismaClient } from "@prisma/client";
import type { CmsLocale } from "@/lib/cms/definitions";
import { CMS_LOCALES, getCmsPageDefinition } from "@/lib/cms/definitions";
import {
  buildAllCmsImportFieldValues,
  buildCmsImportFieldValues,
  getCmsImportPageSlugs,
  type CmsImportContent,
  type CmsImportFieldValue,
  type CmsImportPageSlug,
  type LocaleContentLoader,
} from "@/lib/cms/import/content-sources";
import {
  cmsFieldHasExistingContent,
  isEmptyCmsTiptapDocument,
} from "@/lib/cms/import/tiptap-builders";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { seedCmsPages } from "@/lib/cms/seed";

export type CmsImportFieldAction = "imported" | "skipped_existing" | "skipped_no_source";

export type CmsImportFieldResult = {
  pageSlug: string;
  locale: CmsLocale;
  sectionKey: string;
  fieldKey: string;
  action: CmsImportFieldAction;
};

export type CmsImportSummary = {
  pagesProcessed: string[];
  localesProcessed: CmsLocale[];
  localesSkipped: Array<{ locale: CmsLocale; reason: string }>;
  fieldsImported: number;
  fieldsSkippedExisting: number;
  fieldsSkippedNoSource: number;
  results: CmsImportFieldResult[];
};

type ImportCmsContentOptions = {
  prisma: PrismaClient;
  loadLocaleContent: LocaleContentLoader;
  seedPages?: () => Promise<void>;
};

export type UpdateCmsDraftContentOptions = ImportCmsContentOptions & {
  locale?: CmsLocale;
  pageSlugs?: readonly CmsImportPageSlug[];
};

function serializeDraftJson(draftJson: CmsTiptapJson): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(draftJson)) as Prisma.InputJsonValue;
}

function findExistingItem(
  items: CmsContentItem[],
  locale: CmsLocale,
  fieldKey: string,
): CmsContentItem | undefined {
  return items.find((item) => item.locale === locale && item.fieldKey === fieldKey);
}

export function planCmsImportField(params: {
  field: CmsImportFieldValue;
  locale: CmsLocale;
  existingItem?: Pick<CmsContentItem, "draftJson" | "publishedJson"> | null;
}): CmsImportFieldResult {
  const { field, locale, existingItem } = params;

  if (!field.draftJson || isEmptyCmsTiptapDocument(field.draftJson)) {
    return {
      pageSlug: field.pageSlug,
      locale,
      sectionKey: field.sectionKey,
      fieldKey: field.fieldKey,
      action: "skipped_no_source",
    };
  }

  if (
    existingItem &&
    cmsFieldHasExistingContent({
      draftJson: existingItem.draftJson,
      publishedJson: existingItem.publishedJson,
    })
  ) {
    return {
      pageSlug: field.pageSlug,
      locale,
      sectionKey: field.sectionKey,
      fieldKey: field.fieldKey,
      action: "skipped_existing",
    };
  }

  return {
    pageSlug: field.pageSlug,
    locale,
    sectionKey: field.sectionKey,
    fieldKey: field.fieldKey,
    action: "imported",
  };
}

export async function importCmsContentFromI18n(
  options: ImportCmsContentOptions,
): Promise<CmsImportSummary> {
  const seedPages = options.seedPages ?? seedCmsPages;
  await seedPages();

  const pagesProcessed = getCmsImportPageSlugs();
  const localesProcessed: CmsLocale[] = [];
  const localesSkipped: Array<{ locale: CmsLocale; reason: string }> = [];
  const results: CmsImportFieldResult[] = [];

  for (const locale of CMS_LOCALES) {
    const content: CmsImportContent | null = await options.loadLocaleContent(locale);
    if (!content) {
      localesSkipped.push({
        locale,
        reason:
          locale === "lv"
            ? "No Latvian i18n source file found at src/content/i18n/lv.ts"
            : "No i18n source content available for locale",
      });
      continue;
    }

    localesProcessed.push(locale);
    const fieldValues = buildAllCmsImportFieldValues(content);

    for (const pageSlug of pagesProcessed) {
      const pageDefinition = getCmsPageDefinition(pageSlug);
      const pageRecord = await options.prisma.cmsPage.findUnique({
        where: { slug: pageSlug },
        include: {
          sections: {
            include: { items: true },
          },
        },
      });

      if (!pageDefinition || !pageRecord) continue;

      for (const sectionDef of pageDefinition.sections) {
        let section = pageRecord.sections.find((entry) => entry.key === sectionDef.key);
        if (!section) {
          section = await options.prisma.cmsSection.create({
            data: {
              pageId: pageRecord.id,
              key: sectionDef.key,
              title: sectionDef.title,
              sortOrder: sectionDef.sortOrder,
            },
            include: { items: true },
          });
        }

        for (const field of sectionDef.fields) {
          const importValue = fieldValues.find(
            (entry) =>
              entry.pageSlug === pageSlug &&
              entry.sectionKey === sectionDef.key &&
              entry.fieldKey === field.key,
          );

          const existingItem = findExistingItem(section.items, locale, field.key);
          const planned = planCmsImportField({
            field: importValue ?? {
              pageSlug,
              sectionKey: sectionDef.key,
              fieldKey: field.key,
              draftJson: { type: "doc", content: [] },
            },
            locale,
            existingItem,
          });

          if (planned.action === "imported" && importValue) {
            const plainText = tiptapJsonToPlainText(importValue.draftJson);
            const draftJsonValue = serializeDraftJson(importValue.draftJson);

            await options.prisma.cmsContentItem.upsert({
              where: {
                sectionId_locale_fieldKey: {
                  sectionId: section.id,
                  locale,
                  fieldKey: field.key,
                },
              },
              create: {
                sectionId: section.id,
                locale,
                fieldKey: field.key,
                draftJson: draftJsonValue,
                plainText,
              },
              update: {
                draftJson: draftJsonValue,
                plainText,
              },
            });
          }

          results.push(planned);
        }
      }
    }
  }

  return {
    pagesProcessed,
    localesProcessed,
    localesSkipped,
    fieldsImported: results.filter((entry) => entry.action === "imported").length,
    fieldsSkippedExisting: results.filter((entry) => entry.action === "skipped_existing").length,
    fieldsSkippedNoSource: results.filter((entry) => entry.action === "skipped_no_source").length,
    results,
  };
}

export async function updateCmsDraftContentFromSource(
  options: UpdateCmsDraftContentOptions,
): Promise<CmsImportSummary> {
  const seedPages = options.seedPages ?? seedCmsPages;
  await seedPages();

  const locale = options.locale ?? "en";
  const pageSlugs = options.pageSlugs ?? (["home", "about", "aap", "faq"] as const);
  const content: CmsImportContent | null = await options.loadLocaleContent(locale);

  if (!content) {
    return {
      pagesProcessed: [...pageSlugs],
      localesProcessed: [],
      localesSkipped: [{ locale, reason: "No i18n source content available for locale" }],
      fieldsImported: 0,
      fieldsSkippedExisting: 0,
      fieldsSkippedNoSource: 0,
      results: [],
    };
  }

  const fieldValues = pageSlugs.flatMap((pageSlug) => buildCmsImportFieldValues(content, pageSlug));
  const results: CmsImportFieldResult[] = [];
  let fieldsImported = 0;
  let fieldsSkippedNoSource = 0;

  for (const pageSlug of pageSlugs) {
    const pageDefinition = getCmsPageDefinition(pageSlug);
    const pageRecord = await options.prisma.cmsPage.findUnique({
      where: { slug: pageSlug },
      include: {
        sections: {
          include: { items: true },
        },
      },
    });

    if (!pageDefinition || !pageRecord) continue;

    for (const sectionDef of pageDefinition.sections) {
      let section = pageRecord.sections.find((entry) => entry.key === sectionDef.key);
      if (!section) {
        section = await options.prisma.cmsSection.create({
          data: {
            pageId: pageRecord.id,
            key: sectionDef.key,
            title: sectionDef.title,
            sortOrder: sectionDef.sortOrder,
          },
          include: { items: true },
        });
      }

      for (const field of sectionDef.fields) {
        const importValue = fieldValues.find(
          (entry) =>
            entry.pageSlug === pageSlug &&
            entry.sectionKey === sectionDef.key &&
            entry.fieldKey === field.key,
        );

        if (!importValue || isEmptyCmsTiptapDocument(importValue.draftJson)) {
          fieldsSkippedNoSource += 1;
          results.push({
            pageSlug,
            locale,
            sectionKey: sectionDef.key,
            fieldKey: field.key,
            action: "skipped_no_source",
          });
          continue;
        }

        const plainText = tiptapJsonToPlainText(importValue.draftJson);
        const draftJsonValue = serializeDraftJson(importValue.draftJson);

        await options.prisma.cmsContentItem.upsert({
          where: {
            sectionId_locale_fieldKey: {
              sectionId: section.id,
              locale,
              fieldKey: field.key,
            },
          },
          create: {
            sectionId: section.id,
            locale,
            fieldKey: field.key,
            draftJson: draftJsonValue,
            plainText,
          },
          update: {
            draftJson: draftJsonValue,
            plainText,
          },
        });

        fieldsImported += 1;
        results.push({
          pageSlug,
          locale,
          sectionKey: sectionDef.key,
          fieldKey: field.key,
          action: "imported",
        });
      }
    }
  }

  return {
    pagesProcessed: [...pageSlugs],
    localesProcessed: [locale],
    localesSkipped: [],
    fieldsImported,
    fieldsSkippedExisting: 0,
    fieldsSkippedNoSource,
    results,
  };
}

export function formatCmsImportSummary(summary: CmsImportSummary): string {
  const lines = [
    "CMS content import summary",
    "==========================",
    `Pages processed: ${summary.pagesProcessed.join(", ")}`,
    `Locales processed: ${summary.localesProcessed.join(", ") || "none"}`,
    `Fields imported: ${summary.fieldsImported}`,
    `Fields skipped (existing content): ${summary.fieldsSkippedExisting}`,
    `Fields skipped (no source): ${summary.fieldsSkippedNoSource}`,
  ];

  if (summary.localesSkipped.length > 0) {
    lines.push("", "Locales skipped:");
    for (const entry of summary.localesSkipped) {
      lines.push(`- ${entry.locale}: ${entry.reason}`);
    }
  }

  return lines.join("\n");
}
