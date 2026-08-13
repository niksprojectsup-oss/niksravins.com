import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { deContent } from "./de";
import { enContent } from "./en";
import { esContent } from "./es";
import { frContent } from "./fr";
import { itContent } from "./it";
import { jaContent } from "./ja";
import type { PublicContent } from "./types";
import { zhContent } from "./zh";

const CONTENT_BY_LOCALE: Record<Locale, PublicContent> = {
  en: enContent,
  de: deContent,
  fr: frContent,
  es: esContent,
  it: itContent,
  ja: jaContent,
  zh: zhContent,
};

function localizePaths(content: PublicContent, locale: Locale): PublicContent {
  const bookPath = localizedPath(locale, "book");
  const homePath = localizedPath(locale, "");

  return {
    ...content,
    site: {
      ...content.site,
      bookingUrl: bookPath,
    },
    hero: {
      ...content.hero,
      primaryCta: { ...content.hero.primaryCta, href: bookPath },
      secondaryCta: { ...content.hero.secondaryCta, href: `${homePath}#aap` },
    },
    finalCta: {
      ...content.finalCta,
      button: { ...content.finalCta.button, href: bookPath },
    },
  };
}

export function getPublicContent(locale: Locale): PublicContent {
  const content = CONTENT_BY_LOCALE[locale];
  if (!content) {
    throw new Error(`No public content for locale: ${locale}`);
  }
  return localizePaths(content, locale);
}

export function getAllPublicContent(): PublicContent[] {
  return (Object.keys(CONTENT_BY_LOCALE) as Locale[]).map(getPublicContent);
}
