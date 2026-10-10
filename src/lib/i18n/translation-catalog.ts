import { deContent } from "@/content/i18n/de";
import { enContent } from "@/content/i18n/en";
import { esContent } from "@/content/i18n/es";
import { frContent } from "@/content/i18n/fr";
import { itContent } from "@/content/i18n/it";
import { jaContent } from "@/content/i18n/ja";
import type { PublicContent } from "@/content/i18n/types";
import { zhContent } from "@/content/i18n/zh";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  TRANSLATION_PAGES,
  type TranslationLocale,
  type TranslationPage,
} from "@/lib/i18n/translation-locales";

export type TranslationCatalogEntry = {
  key: string;
  page: TranslationPage;
  section: string;
  sortOrder: number;
};

const FILE_CONTENT_BY_LOCALE: Record<Locale, PublicContent> = {
  en: enContent,
  de: deContent,
  fr: frContent,
  es: esContent,
  it: itContent,
  ja: jaContent,
  zh: zhContent,
};

const HOME_SECTIONS = new Set([
  "hero",
  "foundation",
  "journey",
  "alignment",
  "underneath",
  "identityShifts",
  "roots",
  "trust",
  "about",
  "aap",
  "testimonials",
  "faq",
  "finalCta",
]);

const ADDABLE_LIST_PREFIXES = [
  "faq.items",
  "alignment.items",
  "testimonials.items",
  "trust.statements",
  "hero.explanation",
  "finalCta.lines",
] as const;

export const ADDABLE_LIST_FIELDS: Record<string, readonly string[]> = {
  "faq.items": ["question", "answer"],
  "alignment.items": ["title", "body"],
  "testimonials.items": ["title", "description"],
  "trust.statements": [],
  "hero.explanation": [],
  "finalCta.lines": [],
};

const PLACEHOLDER_PATTERN = /\{[a-zA-Z0-9_]+\}/g;
const UNSAFE_HTML_PATTERN = /<\s*script|javascript:|on\w+\s*=/i;
const MAX_TRANSLATION_LENGTH = 20_000;

export function getFileContentForLocale(locale: Locale): PublicContent {
  return FILE_CONTENT_BY_LOCALE[locale];
}

export function classifyTranslationKey(key: string): {
  page: TranslationPage;
  section: string;
} {
  const parts = key.split(".");
  const root = parts[0] ?? "shared";

  if (root === "seo") {
    const seoPage = parts[1];
    const page: TranslationPage =
      seoPage === "book" || seoPage === "legal" ? seoPage : "home";
    return { page, section: "seo" };
  }

  if (root === "bookingUi") {
    return { page: "book", section: parts[1] ?? "bookingUi" };
  }

  if (root === "bookingPublic" || root === "bookingOffers") {
    return { page: "book", section: root };
  }

  if (root === "legal") {
    return { page: "legal", section: "legal" };
  }

  if (HOME_SECTIONS.has(root)) {
    return { page: "home", section: root };
  }

  return { page: "shared", section: root };
}

export function isProtectedTranslationKey(key: string): boolean {
  if (key === "locale" || key === "translationStatus" || key === "site.bookingUrl") {
    return true;
  }

  const parts = key.split(".");
  const leaf = parts[parts.length - 1];

  if (leaf === "href" || leaf === "bold") {
    return true;
  }

  if (
    leaf === "value" &&
    (parts.includes("countries") || parts.includes("timezones"))
  ) {
    return true;
  }

  return false;
}

export function extractPlaceholders(value: string): string[] {
  return [...value.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[0]).sort();
}

export function placeholdersMatch(source: string, translation: string): boolean {
  const expected = extractPlaceholders(source).join(",");
  const actual = extractPlaceholders(translation).join(",");
  return expected === actual;
}

export function assertSafeTranslationValue(value: string): string {
  if (value.length > MAX_TRANSLATION_LENGTH) {
    throw new Error("Translation is too long.");
  }

  if (UNSAFE_HTML_PATTERN.test(value)) {
    throw new Error("Unsafe HTML is not allowed in translations.");
  }

  return value;
}

export function flattenPublicContent(
  content: unknown,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  collectStringLeaves(content, prefix, result);
  return result;
}

function collectStringLeaves(
  value: unknown,
  prefix: string,
  result: Record<string, string>,
): void {
  if (typeof value === "string") {
    if (prefix && !isProtectedTranslationKey(prefix)) {
      result[prefix] = value;
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringLeaves(item, joinKey(prefix, String(index)), result);
    });
    return;
  }

  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectStringLeaves(childValue, joinKey(prefix, childKey), result);
    }
  }
}

function joinKey(prefix: string, next: string): string {
  return prefix ? `${prefix}.${next}` : next;
}

export function buildTranslationCatalog(
  extraOfferIds: readonly string[] = [],
): TranslationCatalogEntry[] {
  const english = flattenPublicContent(enContent);
  const extraKeys: string[] = [];

  for (const offerId of extraOfferIds) {
    for (const field of ["title", "description", "detail", "durationLabel", "priceLabel", "checkoutNote"] as const) {
      extraKeys.push(`bookingOffers.${offerId}.${field}`);
    }
  }

  const keys = [...new Set([...Object.keys(english), ...extraKeys])].filter(
    (key) => !isProtectedTranslationKey(key),
  );

  return keys
    .sort((left, right) => left.localeCompare(right))
    .map((key, index) => {
      const { page, section } = classifyTranslationKey(key);
      return { key, page, section, sortOrder: index };
    })
    .filter((entry) => (TRANSLATION_PAGES as readonly string[]).includes(entry.page));
}

export function fileTranslationMap(locale: TranslationLocale): Record<string, string> {
  if (locale === "lv") {
    return {};
  }

  return flattenPublicContent(FILE_CONTENT_BY_LOCALE[locale]);
}

export function englishSourceMap(): Record<string, string> {
  return flattenPublicContent(enContent);
}

export function publicFileLocales(): Locale[] {
  return [...LOCALES];
}

export function isAddableListPrefix(prefix: string): boolean {
  return Object.prototype.hasOwnProperty.call(ADDABLE_LIST_FIELDS, prefix);
}

export function nextListIndex(existingKeys: readonly string[], prefix: string): number {
  const pattern = new RegExp(`^${prefix.replace(".", "\\.")}\\.(\\d+)`);
  let max = -1;
  for (const key of existingKeys) {
    const match = key.match(pattern);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return max + 1;
}

export function keysForNewListItem(prefix: string, index: number): string[] {
  const fields = ADDABLE_LIST_FIELDS[prefix];
  if (!fields) {
    throw new Error("This section does not support new items.");
  }
  if (fields.length === 0) {
    return [`${prefix}.${index}`];
  }
  return fields.map((field) => `${prefix}.${index}.${field}`);
}

export const ADDABLE_LISTS = ADDABLE_LIST_PREFIXES;
