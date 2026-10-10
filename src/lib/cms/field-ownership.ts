import { getAllCmsFieldKeys } from "@/lib/cms/definitions";

export type ContentFieldOwner = "cms" | "catalog";

const CMS_OWNED_CATALOG_PREFIXES = [
  "hero.headline",
  "hero.primaryCta.label",
  "hero.secondaryCta.label",
  "foundation.intro",
  "foundation.headline",
  "journey.steps",
  "alignment.items",
  "underneath.intro",
  "underneath.headline",
  "identityShifts",
  "roots.intro",
  "roots.headline",
  "trust.statements",
  "about",
  "aap",
  "faq",
  "finalCta",
  "seo.home",
  "legal.body",
] as const;

const CMS_FIELD_KEYS = new Set([
  ...getAllCmsFieldKeys("home"),
  ...getAllCmsFieldKeys("legal"),
]);

export function isCmsOwnedFieldKey(key: string): boolean {
  return CMS_FIELD_KEYS.has(key) || isCmsOwnedCatalogKey(key);
}

export function isCmsOwnedCatalogKey(key: string): boolean {
  return CMS_OWNED_CATALOG_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}.`));
}

export function getFieldOwner(key: string): ContentFieldOwner {
  return isCmsOwnedFieldKey(key) ? "cms" : "catalog";
}

export function cmsEditorPathForKey(key: string): string {
  return key === "legal.body" || key.startsWith("legal.") ? "/admin/content/legal" : "/admin/content/home";
}
