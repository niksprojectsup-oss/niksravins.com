import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectCmsFieldsForSave,
  shouldSyncCmsEditorFieldsFromServer,
} from "@/lib/cms/draft-save";
import { createEmptyTiptapDocument, tiptapJsonToPlainText } from "@/lib/cms/tiptap";

describe("cms draft save collection", () => {
  it("prefers live editor documents over stale React field state", () => {
    const staleFields = {
      body: createEmptyTiptapDocument("How AAP works"),
    };
    const liveFields = {
      body: createEmptyTiptapDocument("CMS LIVE TEST"),
    };

    const merged = collectCmsFieldsForSave(staleFields, liveFields);
    assert.match(tiptapJsonToPlainText(merged.body), /CMS LIVE TEST/);
  });

  it("keeps React field state for fields without a live editor document", () => {
    const fields = {
      body: createEmptyTiptapDocument("CMS LIVE TEST"),
      "hero.headline": createEmptyTiptapDocument("Updated headline"),
    };

    const merged = collectCmsFieldsForSave(fields, {
      body: createEmptyTiptapDocument("CMS LIVE TEST"),
    });

    assert.match(tiptapJsonToPlainText(merged.body), /CMS LIVE TEST/);
    assert.match(tiptapJsonToPlainText(merged["hero.headline"]), /Updated headline/);
  });

  it("persists hidden homepage hero edits when live refs stay mounted after tab switch", () => {
    const staleFields = {
      "hero.headline": createEmptyTiptapDocument("You understand the reaction But It still happens"),
      "faq.heading": createEmptyTiptapDocument("Frequently asked questions"),
    };
    const liveDocuments = {
      "hero.headline": createEmptyTiptapDocument("CMS HOME TEST"),
      "faq.heading": createEmptyTiptapDocument("Updated FAQ heading"),
    };

    const merged = collectCmsFieldsForSave(staleFields, liveDocuments);

    assert.match(tiptapJsonToPlainText(merged["hero.headline"]), /CMS HOME TEST/);
    assert.match(tiptapJsonToPlainText(merged["faq.heading"]), /Updated FAQ heading/);
  });

  it("does not sync server content over unsaved local edits", () => {
    assert.equal(shouldSyncCmsEditorFieldsFromServer(true), false);
    assert.equal(shouldSyncCmsEditorFieldsFromServer(false), true);
  });
});

describe("cms draft save persistence payload", () => {
  it("serializes edited body content containing CMS LIVE TEST", () => {
    const payload = collectCmsFieldsForSave(
      { body: createEmptyTiptapDocument("How AAP works") },
      { body: createEmptyTiptapDocument("CMS LIVE TEST") },
    );

    const serialized = JSON.parse(JSON.stringify(payload)) as typeof payload;
    assert.equal(serialized.body.type, "doc");
    assert.match(tiptapJsonToPlainText(serialized.body), /CMS LIVE TEST/);
  });
});
