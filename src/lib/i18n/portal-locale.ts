import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { parsePortalLocale } from "@/lib/i18n/portal-locale-parse";
import { secureSessionCookieOptions } from "@/lib/security/cookies";

export const PORTAL_LOCALE_COOKIE = "__nr_portal_locale";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export { parsePortalLocale };

export async function getPortalLocale(): Promise<Locale> {
  const store = await cookies();
  return parsePortalLocale(store.get(PORTAL_LOCALE_COOKIE)?.value);
}

export async function setPortalLocaleCookie(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(PORTAL_LOCALE_COOKIE, locale, secureSessionCookieOptions(ONE_YEAR_SECONDS));
}
