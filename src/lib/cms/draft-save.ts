import { normalizeCmsTiptapJson } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

/**
 * Merge React field state with live Tiptap editor documents.
 * Editor refs win so Save always persists the current document, not stale state.
 */
export function collectCmsFieldsForSave(
  fields: Record<string, CmsTiptapJson>,
  liveDocuments: Record<string, CmsTiptapJson | null | undefined>,
): Record<string, CmsTiptapJson> {
  const merged: Record<string, CmsTiptapJson> = { ...fields };

  for (const [fieldKey, liveDocument] of Object.entries(liveDocuments)) {
    const normalized = normalizeCmsTiptapJson(liveDocument);
    if (normalized) {
      merged[fieldKey] = normalized;
    }
  }

  return merged;
}

/**
 * Returns true when an initial-content sync should replace local field state.
 * Skips while the user has unsaved edits so loaded CMS data cannot clobber them.
 */
export function shouldSyncCmsEditorFieldsFromServer(isDirty: boolean): boolean {
  return !isDirty;
}
