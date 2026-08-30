import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

export function bookingSuccessPath(locale: Locale): string {
  return `${localizedPath(locale, "book")}/success`;
}
