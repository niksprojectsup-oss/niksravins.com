import { prisma } from "@/lib/db/prisma";
import type { IdentityContentEntityType, IdentityContentTranslation } from "@prisma/client";

type TranslationRow = Pick<
  IdentityContentTranslation,
  "entityType" | "entityId" | "field" | "locale" | "publishedValue" | "draftValue" | "translationStatus" | "sourceVersion"
>;

/** locale fallback ķēde: pieprasītā → en → lv (LV ir satura avots). */
export function localeFallbackChain(locale: string): string[] {
  const chain = [locale, "en", "lv"];
  return [...new Set(chain)];
}

export async function loadPublishedTranslations(input: {
  entityType: IdentityContentEntityType;
  entityIds: string[];
  fields?: string[];
  includeDrafts?: boolean;
}): Promise<TranslationRow[]> {
  if (input.entityIds.length === 0) return [];
  return prisma.identityContentTranslation.findMany({
    where: {
      entityType: input.entityType,
      entityId: { in: input.entityIds },
      ...(input.fields ? { field: { in: input.fields } } : {}),
      ...(input.includeDrafts
        ? {}
        : { publishedValue: { not: null } }),
    },
    select: {
      entityType: true,
      entityId: true,
      field: true,
      locale: true,
      publishedValue: true,
      draftValue: true,
      translationStatus: true,
      sourceVersion: true,
    },
  });
}

export function resolveTranslation(
  rows: TranslationRow[],
  input: { entityId: string; field: string; locale: string },
): { value: string; resolvedLocale: string; sourceVersion: number } | null {
  const relevant = rows.filter(
    (row) => row.entityId === input.entityId && row.field === input.field,
  );
  for (const locale of localeFallbackChain(input.locale)) {
    const row = relevant.find((r) => r.locale === locale && r.publishedValue);
    if (row?.publishedValue) {
      return {
        value: row.publishedValue,
        resolvedLocale: locale,
        sourceVersion: row.sourceVersion,
      };
    }
  }
  return null;
}

export async function resolveFieldValue(input: {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
  locale: string;
}): Promise<string | null> {
  const rows = await prisma.identityContentTranslation.findMany({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      publishedValue: { not: null },
    },
    select: {
      entityType: true, entityId: true, field: true, locale: true,
      publishedValue: true, draftValue: true, translationStatus: true, sourceVersion: true,
    },
  });
  return resolveTranslation(rows, input)?.value ?? null;
}

/** Vienotas entītijas (SAFETY_TEXT, CONSENT_TEXT) resolve ar fallback. */
export async function resolveSingleton(input: {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
  locale: string;
}): Promise<{ value: string; sourceVersion: number } | null> {
  const rows = await prisma.identityContentTranslation.findMany({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      publishedValue: { not: null },
    },
  });
  return resolveTranslation(rows, input);
}
