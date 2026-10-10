import type { PublicContent } from "@/content/i18n/types";
import {
  flattenPublicContent,
  isProtectedTranslationKey,
} from "@/lib/i18n/translation-catalog";

export function applyTranslationOverlay<T>(
  source: T,
  overlay: Record<string, string>,
): T {
  const target = structuredClone(source);

  for (const [key, value] of Object.entries(overlay)) {
    if (!value || isProtectedTranslationKey(key)) {
      continue;
    }
    setDeepString(target, key.split("."), value);
  }

  return target;
}

export function applyPublishedOverlay(
  content: PublicContent,
  overlay: Record<string, string>,
): PublicContent {
  return applyTranslationOverlay(content, overlay);
}

export function applyEnglishCatalogFallback<T>(
  localeContent: T,
  englishContent: T,
): T {
  const localeMap = flattenPublicContent(localeContent);
  const englishMap = flattenPublicContent(englishContent);
  const missing: Record<string, string> = {};

  for (const [key, englishValue] of Object.entries(englishMap)) {
    if (!localeMap[key] && englishValue) {
      missing[key] = englishValue;
    }
  }

  return applyTranslationOverlay(localeContent, missing);
}

function setDeepString(target: unknown, parts: string[], value: string): void {
  if (typeof target !== "object" || target === null) {
    return;
  }

  let current: Record<string, unknown> | unknown[] = target as Record<string, unknown>;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const nextPart = parts[index + 1];
    const nextIsIndex = isIndex(nextPart);

    if (Array.isArray(current)) {
      const arrayIndex = Number(part);
      if (!Number.isInteger(arrayIndex) || arrayIndex < 0) {
        return;
      }
      while (current.length <= arrayIndex) {
        current.push(inferArrayItem(current, parts.slice(index + 1)));
      }
      const child = current[arrayIndex];
      if (typeof child !== "object" || child === null) {
        current[arrayIndex] = nextIsIndex ? [] : {};
      }
      current = current[arrayIndex] as Record<string, unknown> | unknown[];
      continue;
    }

    if (!(part in current) || current[part] == null) {
      current[part] = nextIsIndex ? [] : {};
    }

    const child = current[part];
    if (typeof child !== "object" || child === null) {
      current[part] = nextIsIndex ? [] : {};
    }

    current = current[part] as Record<string, unknown> | unknown[];
  }

  const leaf = parts[parts.length - 1];
  if (Array.isArray(current)) {
    if (!isIndex(leaf)) {
      return;
    }
    const arrayIndex = Number(leaf);
    while (current.length <= arrayIndex) {
      current.push("");
    }
    current[arrayIndex] = value;
    return;
  }

  current[leaf] = value;
}

function isIndex(value: string): boolean {
  return /^\d+$/.test(value);
}

function inferArrayItem(existing: unknown[], remaining: string[]): unknown {
  if (existing.length > 0) {
    return blankClone(existing[0]);
  }

  if (remaining.length > 1) {
    return {};
  }

  return "";
}

function blankClone(value: unknown): unknown {
  if (typeof value === "string") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(blankClone);
  }

  if (value && typeof value === "object") {
    const clone: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === "href" || key === "value" || key === "bold") {
        clone[key] = child;
        continue;
      }
      clone[key] = blankClone(child);
    }
    return clone;
  }

  return value;
}

export function planSeedValue(existing: { draftValue: string; publishedValue: string | null } | null) {
  return existing ? "skip" : "create";
}

export function publishedValueFromDraft(draftValue: string): string {
  return draftValue;
}

export function isMissingTranslation(
  locale: string,
  draftValue: string | null | undefined,
  publishedValue: string | null | undefined,
): boolean {
  if (locale === "en") {
    return false;
  }
  return !draftValue && !publishedValue;
}

export function isUntranslatedFallback(
  locale: string,
  englishSource: string,
  draftValue: string | null | undefined,
  publishedValue: string | null | undefined,
): boolean {
  if (locale === "en" || !englishSource) {
    return false;
  }
  const current = publishedValue || draftValue || "";
  return current === englishSource;
}
