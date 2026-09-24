import type { CmsTiptapJson } from "@/lib/cms/types";

export function serializeTiptapDocument(value: CmsTiptapJson): string {
  return JSON.stringify(value);
}

/**
 * External CMS content should only be pushed into Tiptap when syncVersion bumps
 * (initial load, locale change, server refresh). Parent onChange updates must not
 * trigger setContent, or the cursor jumps to the document end.
 */
export function shouldApplyExternalEditorContent(input: {
  syncVersion: number;
  lastAppliedSyncVersion: number;
}): boolean {
  return input.syncVersion !== input.lastAppliedSyncVersion;
}
