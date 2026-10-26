import {
  applyLocalizedPaths,
  getFilePublicContent,
  getPublicContent,
} from "@/content/i18n";
import type { PublicContent } from "@/content/i18n/types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import {
  applyEnglishCatalogFallback,
  applyLatvianFooterCatalog,
  applyPublishedOverlay,
} from "@/lib/i18n/translation-overlay";
import { getPublishedTranslationOverlay } from "@/lib/i18n/translation-repository";

function resolveLocaleContent(content: PublicContent, english: PublicContent, locale: Locale): PublicContent {
  const withFallback = applyEnglishCatalogFallback(content, english);
  const file = getFilePublicContent(locale);
  return applyLocalizedPaths(applyLatvianFooterCatalog(withFallback, file, locale), locale);
}

export async function getResolvedPublicContent(locale: Locale): Promise<PublicContent> {
  try {
    const overlay = await getPublishedTranslationOverlay(locale);
    const merged = applyPublishedOverlay(getFilePublicContent(locale), overlay);

    if (locale === DEFAULT_LOCALE) {
      return applyLocalizedPaths(merged, locale);
    }

    const englishOverlay = await getPublishedTranslationOverlay(DEFAULT_LOCALE);
    const english = applyPublishedOverlay(getFilePublicContent(DEFAULT_LOCALE), englishOverlay);
    return resolveLocaleContent(merged, english, locale);
  } catch {
    if (locale === DEFAULT_LOCALE) {
      return getPublicContent(locale);
    }
    return resolveLocaleContent(getFilePublicContent(locale), getFilePublicContent(DEFAULT_LOCALE), locale);
  }
}
