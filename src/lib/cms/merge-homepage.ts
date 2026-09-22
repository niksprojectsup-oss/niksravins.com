import type { PublicContent } from "@/content/i18n/types";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

const HOME_SEO_FIELD_KEYS = ["seo.home.title", "seo.home.description"] as const;

function setDeepValue(root: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let current: Record<string, unknown> | unknown[] = root;

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index]!;
    const isLast = index === keys.length - 1;

    if (isLast) {
      if (Array.isArray(current)) {
        current[Number(key)] = value;
      } else {
        current[key] = value;
      }
      return;
    }

    const nextKey = keys[index + 1]!;
    const nextIsIndex = /^\d+$/.test(nextKey);

    if (Array.isArray(current)) {
      const arrayIndex = Number(key);
      if (!current[arrayIndex] || typeof current[arrayIndex] !== "object") {
        current[arrayIndex] = nextIsIndex ? [] : {};
      }
      current = current[arrayIndex] as Record<string, unknown>;
      continue;
    }

    if (nextIsIndex) {
      if (!Array.isArray(current[key])) {
        current[key] = [];
      }
      const array = current[key] as unknown[];
      const arrayIndex = Number(nextKey);
      const followingKey = keys[index + 2];
      const needsObject = followingKey !== undefined && !/^\d+$/.test(followingKey);

      if (!array[arrayIndex] || typeof array[arrayIndex] !== "object") {
        array[arrayIndex] = needsObject ? {} : "";
      }

      if (needsObject) {
        current = array[arrayIndex] as Record<string, unknown>;
        index += 1;
      } else {
        array[arrayIndex] = value;
        return;
      }
    } else {
      if (!current[key] || typeof current[key] !== "object" || Array.isArray(current[key])) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  }
}

/** @deprecated Use published Tiptap fields with CmsPublishedFieldText for homepage body content. */
export function applyCmsFieldsToHomeContent(
  base: PublicContent,
  fields: Record<string, string>,
): PublicContent {
  if (Object.keys(fields).length === 0) {
    return base;
  }

  const clone = structuredClone(base) as unknown as Record<string, unknown>;

  for (const [fieldKey, rawValue] of Object.entries(fields)) {
    const value = rawValue.trim();
    if (!value) continue;
    setDeepValue(clone, fieldKey, value);
  }

  return clone as unknown as PublicContent;
}

export function applyCmsSeoFieldsToHomeContent(
  base: PublicContent,
  fields: Record<string, CmsTiptapJson>,
): PublicContent {
  if (Object.keys(fields).length === 0) {
    return base;
  }

  const clone = structuredClone(base) as unknown as Record<string, unknown>;

  for (const fieldKey of HOME_SEO_FIELD_KEYS) {
    const document = fields[fieldKey];
    if (!document) continue;

    const value = tiptapJsonToPlainText(document).trim();
    if (!value) continue;
    setDeepValue(clone, fieldKey, value);
  }

  return clone as unknown as PublicContent;
}

export function isCmsSupportedPublicLocale(locale: string): boolean {
  return locale === "en" || locale === "lv";
}
