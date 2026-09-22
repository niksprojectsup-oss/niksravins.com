import { generateHTML } from "@tiptap/html/server";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { CMS_TIPTAP_EXTENSIONS } from "@/lib/cms/tiptap";

export function tiptapJsonToHtml(value: CmsTiptapJson | null | undefined): string {
  if (!value) return "";
  return generateHTML(value, CMS_TIPTAP_EXTENSIONS);
}
