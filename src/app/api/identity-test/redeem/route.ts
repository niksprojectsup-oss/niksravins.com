import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BETA_COOKIE_NAME, betaCookieOptions, redeemBetaToken } from "@/lib/identity-test/beta";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isLocale } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/** GET /api/identity-test/redeem?token=<t>&locale=<l> — beta uzaicinājuma aktivizēšana. */
export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limit = await checkRateLimit("api.general", `identity-beta:${ip}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  const home = new URL("/", request.nextUrl.origin);
  if (!limit.allowed) return NextResponse.redirect(home);

  const token = request.nextUrl.searchParams.get("token") ?? "";
  const localeParam = request.nextUrl.searchParams.get("locale") ?? DEFAULT_LOCALE;
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const target = new URL(
    locale === DEFAULT_LOCALE ? "/identity-test" : `/${locale}/identity-test`,
    request.nextUrl.origin,
  );

  if (!(await redeemBetaToken(token))) {
    // Nederīgs/novecojis tokens — cookie netiek iestatīts; lietotājs redz slēgtās beta paziņojumu.
    return NextResponse.redirect(target);
  }
  const res = NextResponse.redirect(target);
  const opts = betaCookieOptions();
  res.cookies.set(BETA_COOKIE_NAME, token, opts);
  return res;
}
