import { Prisma } from "@prisma/client";
import type { CmsPageDefinition } from "@/lib/cms/definitions";
import type { CmsLocale } from "@/lib/cms/definitions";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

export type CmsDraftItemWrite = {
  id: string;
  sectionId: string;
  locale: CmsLocale;
  fieldKey: string;
  draftJson: Prisma.InputJsonValue | null;
  plainText: string | null;
};

export type CmsSectionRecord = {
  id: string;
  key: string;
};

export type CmsPublishItem = {
  id: string;
  locale: string;
  draftJson: unknown;
};

function cloneDraftJson(value: CmsTiptapJson | null): Prisma.InputJsonValue | null {
  if (!value) return null;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function planCmsDraftItemWrites(input: {
  sections: readonly CmsSectionRecord[];
  definition: CmsPageDefinition;
  locale: CmsLocale;
  fields: Record<string, CmsTiptapJson | null>;
  createId?: () => string;
}): CmsDraftItemWrite[] {
  const createId = input.createId ?? (() => crypto.randomUUID());
  const sectionsByKey = new Map(input.sections.map((section) => [section.key, section]));
  const writes: CmsDraftItemWrite[] = [];

  for (const sectionDef of input.definition.sections) {
    const section = sectionsByKey.get(sectionDef.key);
    if (!section) continue;

    const allowed = new Set(sectionDef.fields.map((field) => field.key));

    for (const [fieldKey, draftJson] of Object.entries(input.fields)) {
      if (!allowed.has(fieldKey)) continue;

      writes.push({
        id: createId(),
        sectionId: section.id,
        locale: input.locale,
        fieldKey,
        draftJson: cloneDraftJson(draftJson),
        plainText: draftJson ? tiptapJsonToPlainText(draftJson) : null,
      });
    }
  }

  return writes;
}

export function missingCmsSectionKeys(
  definition: CmsPageDefinition,
  sections: readonly CmsSectionRecord[],
): string[] {
  const existing = new Set(sections.map((section) => section.key));
  return definition.sections.filter((section) => !existing.has(section.key)).map((section) => section.key);
}

export function planCmsPublishItemIds(
  items: readonly CmsPublishItem[],
  locale: CmsLocale,
): string[] {
  return items.filter((item) => item.locale === locale && item.draftJson).map((item) => item.id);
}

function draftJsonSql(value: Prisma.InputJsonValue | null): Prisma.Sql {
  if (value === null) {
    return Prisma.sql`NULL::jsonb`;
  }

  return Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export function buildCmsDraftSaveQuery(pageId: string, writes: readonly CmsDraftItemWrite[]): Prisma.Sql {
  if (writes.length === 0) {
    throw new Error("CMS draft save requires at least one field write.");
  }

  return Prisma.sql`
    WITH upserted AS (
      INSERT INTO "CmsContentItem" (
        "id",
        "sectionId",
        "locale",
        "fieldKey",
        "draftJson",
        "plainText",
        "createdAt",
        "updatedAt"
      )
      VALUES ${Prisma.join(
        writes.map(
          (write) => Prisma.sql`(
            ${write.id},
            ${write.sectionId},
            ${write.locale},
            ${write.fieldKey},
            ${draftJsonSql(write.draftJson)},
            ${write.plainText},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )`,
        ),
      )}
      ON CONFLICT ("sectionId", "locale", "fieldKey")
      DO UPDATE SET
        "draftJson" = EXCLUDED."draftJson",
        "plainText" = EXCLUDED."plainText",
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING "id"
    )
    UPDATE "CmsPage"
    SET "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${pageId}
  `;
}

export function buildCmsPublishQuery(pageId: string, itemIds: readonly string[]): Prisma.Sql {
  if (itemIds.length === 0) {
    return Prisma.sql`
      UPDATE "CmsPage"
      SET "status" = 'PUBLISHED'::"CmsPageStatus",
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${pageId}
    `;
  }

  return Prisma.sql`
    WITH published AS (
      UPDATE "CmsContentItem"
      SET
        "publishedJson" = "draftJson",
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" IN (${Prisma.join(itemIds)})
        AND "draftJson" IS NOT NULL
      RETURNING "id"
    )
    UPDATE "CmsPage"
    SET "status" = 'PUBLISHED'::"CmsPageStatus",
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${pageId}
  `;
}

export function cmsSqlText(query: Prisma.Sql): string {
  return query.strings.join("?");
}

export function cmsSqlValues(query: Prisma.Sql): unknown[] {
  return [...query.values];
}
