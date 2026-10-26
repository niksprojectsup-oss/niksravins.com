import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  buildTranslationCatalog,
  classifyTranslationKey,
  englishSourceMap,
  fileTranslationMap,
  isAddableListPrefix,
  keysForNewListItem,
  nextListIndex,
  type TranslationCatalogEntry,
} from "@/lib/i18n/translation-catalog";
import {
  TRANSLATION_LOCALES,
  type TranslationLocale,
} from "@/lib/i18n/translation-locales";
import {
  isMissingTranslation,
  isUntranslatedFallback,
} from "@/lib/i18n/translation-overlay";

export type TranslationRow = {
  id: string;
  key: string;
  page: string;
  section: string;
  sortOrder: number;
  englishSource: string;
  draftValue: string;
  publishedValue: string;
  missing: boolean;
  untranslated: boolean;
  unpublished: boolean;
};

let publishedOverlayCache = new Map<string, Record<string, string>>();

export function invalidatePublishedTranslationCache(): void {
  publishedOverlayCache = new Map();
}

export async function seedTranslationCatalog(
  extraOfferIds: readonly string[] = [],
): Promise<{ createdKeys: number; createdValues: number }> {
  if (!isDatabaseConfigured()) {
    return { createdKeys: 0, createdValues: 0 };
  }

  const catalog = buildTranslationCatalog(extraOfferIds);
  const existingEntries = await prisma.translationEntry.findMany({
    select: { id: true, key: true },
  });
  const entryByKey = new Map(existingEntries.map((entry) => [entry.key, entry.id]));

  const missingEntries = catalog.filter((entry) => !entryByKey.has(entry.key));
  if (missingEntries.length > 0) {
    await prisma.translationEntry.createMany({
      data: missingEntries.map((entry) => ({
        key: entry.key,
        page: entry.page,
        section: entry.section,
        sortOrder: entry.sortOrder,
      })),
      skipDuplicates: true,
    });
  }

  const allEntries = await prisma.translationEntry.findMany({
    select: { id: true, key: true },
  });
  const entryIds = new Map(allEntries.map((entry) => [entry.key, entry.id]));

  const existingValues = await prisma.translationValue.findMany({
    select: { entryId: true, locale: true },
  });
  const existingValueKeys = new Set(
    existingValues.map((value) => `${value.entryId}:${value.locale}`),
  );

  const valuesToCreate: {
    entryId: string;
    locale: string;
    draftValue: string;
    publishedValue: string;
  }[] = [];

  for (const locale of TRANSLATION_LOCALES) {
    const fileMap = fileTranslationMap(locale);
    for (const [key, fileValue] of Object.entries(fileMap)) {
      const entryId = entryIds.get(key);
      if (!entryId || !fileValue) {
        continue;
      }
      if (existingValueKeys.has(`${entryId}:${locale}`)) {
        continue;
      }
      valuesToCreate.push({
        entryId,
        locale,
        draftValue: fileValue,
        publishedValue: fileValue,
      });
    }
  }

  if (valuesToCreate.length > 0) {
    await prisma.translationValue.createMany({
      data: valuesToCreate,
      skipDuplicates: true,
    });
  }

  return {
    createdKeys: missingEntries.length,
    createdValues: valuesToCreate.length,
  };
}

export async function getPublishedTranslationOverlay(
  locale: string,
): Promise<Record<string, string>> {
  if (!isDatabaseConfigured()) {
    return {};
  }

  const cached = publishedOverlayCache.get(locale);
  if (cached) {
    return cached;
  }

  const rows = await prisma.translationValue.findMany({
    where: {
      locale,
      publishedValue: { not: null },
    },
    select: {
      publishedValue: true,
      entry: { select: { key: true } },
    },
  });

  const overlay: Record<string, string> = {};
  for (const row of rows) {
    if (row.publishedValue) {
      overlay[row.entry.key] = row.publishedValue;
    }
  }

  publishedOverlayCache.set(locale, overlay);
  return overlay;
}

export async function listTranslationRows(
  locale: TranslationLocale,
): Promise<TranslationRow[]> {
  if (!isDatabaseConfigured()) {
    return buildFileFallbackRows(locale);
  }

  const english = englishSourceMap();
  const entries = await prisma.translationEntry.findMany({
    include: {
      values: {
        where: { locale: { in: [locale, "en"] } },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  return entries.map((entry) => {
    const localeValue = entry.values.find((value) => value.locale === locale);
    const englishValue = entry.values.find((value) => value.locale === "en");
    const englishSource =
      english[entry.key] ?? englishValue?.publishedValue ?? englishValue?.draftValue ?? "";
    const draftValue = localeValue?.draftValue ?? "";
    const publishedValue = localeValue?.publishedValue ?? "";

    return {
      id: entry.id,
      key: entry.key,
      page: entry.page,
      section: entry.section,
      sortOrder: entry.sortOrder,
      englishSource,
      draftValue,
      publishedValue,
      missing: isMissingTranslation(locale, draftValue, publishedValue),
      untranslated: isUntranslatedFallback(locale, englishSource, draftValue, publishedValue),
      unpublished: Boolean(draftValue) && draftValue !== publishedValue,
    };
  });
}

function buildFileFallbackRows(locale: TranslationLocale): TranslationRow[] {
  const english = englishSourceMap();
  const fileMap = fileTranslationMap(locale);
  const catalog = buildTranslationCatalog();

  return catalog.map((entry: TranslationCatalogEntry) => {
    const englishSource = english[entry.key] ?? "";
    const value = fileMap[entry.key] ?? "";
    return {
      id: entry.key,
      key: entry.key,
      page: entry.page,
      section: entry.section,
      sortOrder: entry.sortOrder,
      englishSource,
      draftValue: value,
      publishedValue: value,
      missing: isMissingTranslation(locale, value, value),
      untranslated: isUntranslatedFallback(locale, englishSource, value, value),
      unpublished: false,
    };
  });
}

export async function saveTranslationDrafts(input: {
  locale: TranslationLocale;
  drafts: { key: string; value: string }[];
}): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const keys = input.drafts.map((draft) => draft.key);
  const entries = await prisma.translationEntry.findMany({
    where: { key: { in: keys } },
    select: { id: true, key: true },
  });
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry.id]));

  const missingKeys = keys.filter((key) => !entryByKey.has(key));
  if (missingKeys.length > 0) {
    throw new Error(`Unknown translation keys: ${missingKeys.join(", ")}`);
  }

  await prisma.$transaction(
    input.drafts.map((draft) =>
      prisma.translationValue.upsert({
        where: {
          entryId_locale: {
            entryId: entryByKey.get(draft.key)!,
            locale: input.locale,
          },
        },
        create: {
          entryId: entryByKey.get(draft.key)!,
          locale: input.locale,
          draftValue: draft.value,
        },
        update: {
          draftValue: draft.value,
        },
      }),
    ),
  );
}

export async function publishTranslationLocale(locale: TranslationLocale): Promise<number> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const values = await prisma.translationValue.findMany({
    where: { locale },
    select: { id: true, draftValue: true, publishedValue: true },
  });

  const changed = values.filter((value) => value.draftValue !== value.publishedValue);
  if (changed.length === 0) {
    invalidatePublishedTranslationCache();
    return 0;
  }

  await prisma.$transaction(
    changed.map((value) =>
      prisma.translationValue.update({
        where: { id: value.id },
        data: { publishedValue: value.draftValue },
      }),
    ),
  );

  invalidatePublishedTranslationCache();
  return changed.length;
}

export async function addTranslationListItem(input: {
  prefix: string;
  fields: Record<string, string>;
}): Promise<string[]> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!isAddableListPrefix(input.prefix)) {
    throw new Error("This section does not support new items.");
  }

  const existing = await prisma.translationEntry.findMany({
    where: { key: { startsWith: `${input.prefix}.` } },
    select: { key: true, sortOrder: true },
  });
  const index = nextListIndex(existing.map((entry) => entry.key), input.prefix);
  const keys = keysForNewListItem(input.prefix, index);
  const maxSort = existing.reduce((max, entry) => Math.max(max, entry.sortOrder), 0);

  await prisma.$transaction(async (tx) => {
    for (const [offset, key] of keys.entries()) {
      const itemKey = `${input.prefix}.${index}`;
      const field = key === itemKey ? "value" : key.slice(itemKey.length + 1);
      const englishValue = input.fields[field] ?? input.fields.value ?? "";
      const { page, section } = classifyTranslationKey(key);

      const entry = await tx.translationEntry.create({
        data: {
          key,
          page,
          section,
          sortOrder: maxSort + offset + 1,
        },
      });

      if (englishValue) {
        await tx.translationValue.create({
          data: {
            entryId: entry.id,
            locale: "en",
            draftValue: englishValue,
          },
        });
      }
    }
  });

  return keys;
}
