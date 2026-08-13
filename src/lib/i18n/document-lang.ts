import type { Locale } from "./config";
import { getLocaleFromPathname } from "./paths";

/** BCP 47 language tag for the document `<html lang>` attribute. */
export function getDocumentHtmlLangFromPathname(pathname: string): Locale {
  return getLocaleFromPathname(pathname);
}
