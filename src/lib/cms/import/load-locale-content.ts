import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { enContent } from "@/content/i18n/en";
import type { CmsLocale } from "@/lib/cms/definitions";
import type { CmsImportContent, LocaleContentLoader } from "@/lib/cms/import/content-sources";

async function loadLatvianImportContent(): Promise<CmsImportContent | null> {
  const lvFile = join(process.cwd(), "src/content/i18n/lv.ts");
  if (!existsSync(lvFile)) {
    return null;
  }

  const module = (await import(pathToFileURL(lvFile).href)) as {
    lvContent?: CmsImportContent;
  };

  return module.lvContent ?? null;
}

export const loadCmsImportLocaleContent: LocaleContentLoader = async (locale: CmsLocale) => {
  if (locale === "en") {
    return enContent as CmsImportContent;
  }

  if (locale === "lv") {
    try {
      return await loadLatvianImportContent();
    } catch {
      return null;
    }
  }

  return null;
};
