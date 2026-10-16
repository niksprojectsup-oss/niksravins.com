import { isCmsOwnedCatalogKey } from "@/lib/cms/field-ownership";
import {
  assertSafeTranslationValue,
  englishSourceMap,
  isProtectedTranslationKey,
  placeholdersMatch,
} from "@/lib/i18n/translation-catalog";
import {
  assertTranslationLocale,
  type TranslationLocale,
} from "@/lib/i18n/translation-locales";

export function assertCanEditTranslations(role: string | undefined): void {
  if (role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export type TranslationDraftInput = {
  key: string;
  value: string;
};

export function validateTranslationDrafts(
  locale: string,
  drafts: TranslationDraftInput[],
): { locale: TranslationLocale; drafts: TranslationDraftInput[] } {
  const parsedLocale = assertTranslationLocale(locale);
  const english = englishSourceMap();

  if (!Array.isArray(drafts) || drafts.length === 0) {
    throw new Error("No translations to save.");
  }

  if (drafts.length > 1000) {
    throw new Error("Too many translations in one save.");
  }

  const validated: TranslationDraftInput[] = [];
  const seen = new Set<string>();

  for (const draft of drafts) {
    if (!draft || typeof draft.key !== "string" || typeof draft.value !== "string") {
      throw new Error("Invalid translation payload.");
    }

    const key = draft.key.trim();
    if (!key || seen.has(key)) {
      throw new Error("Invalid or duplicate translation key.");
    }
    if (isProtectedTranslationKey(key) || isCmsOwnedCatalogKey(key)) {
      throw new Error("This key is not editable.");
    }

    const value = assertSafeTranslationValue(draft.value);
    const source = english[key];
    if (source && value && !placeholdersMatch(source, value)) {
      throw new Error(`Preserve placeholders for ${key}.`);
    }

    seen.add(key);
    validated.push({ key, value });
  }

  return { locale: parsedLocale, drafts: validated };
}
