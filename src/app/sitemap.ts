import type { MetadataRoute } from "next";
import {
  LOCALIZED_PUBLIC_PAGES,
  type LocalizedPublicPage,
} from "@/lib/i18n/config";
import { getPublishedLocalesForPage, localizedPath } from "@/lib/i18n/paths";
import { absoluteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of LOCALIZED_PUBLIC_PAGES) {
    const locales = getPublishedLocalesForPage(page);

    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, page as LocalizedPublicPage)),
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.9,
        alternates: {
          languages: buildSitemapAlternates(page as LocalizedPublicPage),
        },
      });
    }
  }

  return entries;
}

function buildSitemapAlternates(page: LocalizedPublicPage): Record<string, string> {
  const locales = getPublishedLocalesForPage(page);
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    const hreflang = locale === "zh" ? "zh-Hans" : locale;
    languages[hreflang] = absoluteUrl(localizedPath(locale, page));
  }

  languages["x-default"] = absoluteUrl(localizedPath("en", page));

  return languages;
}
