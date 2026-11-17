import { LOCALIZED_PUBLIC_PAGES, type Locale, type LocalizedPublicPage } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { deContent } from "./de";
import { enContent } from "./en";
import { esContent } from "./es";
import { frContent } from "./fr";
import { itContent } from "./it";
import { jaContent } from "./ja";
import { lvContent } from "./lv";
import type { PublicContent } from "./types";
import { zhContent } from "./zh";

const CONTENT_BY_LOCALE: Record<Locale, PublicContent> = {
  en: enContent,
  lv: lvContent,
  de: deContent,
  fr: frContent,
  es: esContent,
  it: itContent,
  ja: jaContent,
  zh: zhContent,
};

function localizeHomeSectionHref(href: string, homePath: string, locale: Locale): string {
  if (href.startsWith("#")) {
    return `${homePath}${href}`;
  }
  // Kaili publisko lapu ceļi ("/identity-test", "/book", "/legal") → uz apmeklētāja valodas ceļu.
  const page = href.startsWith("/") ? href.slice(1) : null;
  if (page && (LOCALIZED_PUBLIC_PAGES as readonly string[]).includes(page)) {
    return localizedPath(locale, page as LocalizedPublicPage);
  }

  return href;
}

export function getFilePublicContent(locale: Locale): PublicContent {
  const content = CONTENT_BY_LOCALE[locale];
  if (!content) {
    throw new Error(`No public content for locale: ${locale}`);
  }
  return content;
}

export function applyLocalizedPaths(content: PublicContent, locale: Locale): PublicContent {
  const bookPath = localizedPath(locale, "book");
  const homePath = localizedPath(locale, "");

  return {
    ...content,
    site: {
      ...content.site,
      bookingUrl: bookPath,
    },
    navigation: content.navigation.map((item) => ({
      ...item,
      href: localizeHomeSectionHref(item.href, homePath, locale),
    })),
    hero: {
      ...content.hero,
      primaryCta: { ...content.hero.primaryCta, href: bookPath },
      secondaryCta: {
        ...content.hero.secondaryCta,
        href: localizeHomeSectionHref(content.hero.secondaryCta.href, homePath, locale),
      },
      tertiaryCta: {
        ...content.hero.tertiaryCta,
        href: localizeHomeSectionHref(content.hero.tertiaryCta.href, homePath, locale),
      },
    },
    finalCta: {
      ...content.finalCta,
      button: { ...content.finalCta.button, href: bookPath },
    },
  };
}

export function getPublicContent(locale: Locale): PublicContent {
  return applyLocalizedPaths(getFilePublicContent(locale), locale);
}

export function getAllPublicContent(): PublicContent[] {
  return (Object.keys(CONTENT_BY_LOCALE) as Locale[]).map(getPublicContent);
}
