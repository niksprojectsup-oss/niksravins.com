import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  serializeTiptapDocument,
  shouldApplyExternalEditorContent,
} from "@/lib/cms/editor-sync";
import { createEmptyTiptapDocument } from "@/lib/cms/tiptap";

describe("cms editor external sync", () => {
  it("does not re-apply content when syncVersion is unchanged after typing", () => {
    assert.equal(
      shouldApplyExternalEditorContent({ syncVersion: 2, lastAppliedSyncVersion: 2 }),
      false,
    );
  });

  it("applies content when syncVersion bumps from server sync", () => {
    assert.equal(
      shouldApplyExternalEditorContent({ syncVersion: 3, lastAppliedSyncVersion: 2 }),
      true,
    );
  });

  it("applies content on initial editor mount", () => {
    assert.equal(
      shouldApplyExternalEditorContent({ syncVersion: 0, lastAppliedSyncVersion: -1 }),
      true,
    );
  });

  it("serializes tiptap documents consistently for comparison", () => {
    const document = createEmptyTiptapDocument("Hello");
    assert.equal(serializeTiptapDocument(document), JSON.stringify(document));
  });
});
