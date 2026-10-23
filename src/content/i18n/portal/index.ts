import type { Locale } from "@/lib/i18n/config";
import { dePortal } from "./de";
import { enPortal } from "./en";
import { esPortal } from "./es";
import { frPortal } from "./fr";
import { itPortal } from "./it";
import { jaPortal } from "./ja";
import { lvPortal } from "./lv";
import type { PortalContent } from "./types";
import { zhPortal } from "./zh";

const PORTAL_BY_LOCALE: Record<Locale, PortalContent> = {
  en: enPortal,
  lv: lvPortal,
  de: dePortal,
  fr: frPortal,
  es: esPortal,
  it: itPortal,
  ja: jaPortal,
  zh: zhPortal,
};

export function getPortalContent(locale: Locale): PortalContent {
  return PORTAL_BY_LOCALE[locale] ?? enPortal;
}

export function portalIntlLocale(locale: Locale): string {
  return locale === "zh" ? "zh-Hans" : locale;
}

export function formatPortalGreeting(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

export { PORTAL_BY_LOCALE };
export type { PortalContent };
