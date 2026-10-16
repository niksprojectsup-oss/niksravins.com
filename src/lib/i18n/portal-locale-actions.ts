"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/locales";
import { setPortalLocaleCookie } from "@/lib/i18n/portal-locale";

export async function setPortalLocaleAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "");
  if (!isLocale(locale)) return;
  await setPortalLocaleCookie(locale);

  const referer = (await headers()).get("referer");
  let nextPath = "/client/login";
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.pathname.startsWith("/client")) {
        nextPath = `${url.pathname}${url.search}`;
      }
    } catch {
      nextPath = "/client/login";
    }
  }

  redirect(nextPath);
}
