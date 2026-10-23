import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSchema } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import { getPublishedCmsFieldHtml } from "@/lib/cms/published-field-html";
import { CMS_TIPTAP_EXTENSIONS } from "@/lib/cms/tiptap";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";
import {
  CMS_EDITOR_BODY_FONT_SIZE_LABEL,
  CMS_EDITOR_HEADING_FONT_SIZE_LABEL,
  CMS_FONT_SIZE_INHERIT_LABEL,
  CMS_FONT_SIZE_MIXED_LABEL,
  activeFontSizeControlText,
  activeFontSizeEditorHint,
  fontSizeInheritIsActive,
  fontSizePresetIsActive,
  inspectActiveFontSize,
  shouldClearExplicitFontSize,
} from "./font-size-state";

const schema = getSchema(CMS_TIPTAP_EXTENSIONS);

function documentState(json: CmsTiptapJson, from: number, to = from) {
  const doc = schema.nodeFromJSON(json);
  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, from, to),
  });
}

function textRange(doc: ProseMirrorNode, text: string) {
  let found: { from: number; to: number } | null = null;
  doc.descendants((node, pos) => {
    if (found || !node.isText || !node.text) return;
    const index = node.text.indexOf(text);
    if (index === -1) return;
    found = { from: pos + index, to: pos + index + text.length };
  });
  if (!found) throw new Error(`Missing text: ${text}`);
  return found;
}

function stateForText(json: CmsTiptapJson, startText: string, endText = startText) {
  const doc = schema.nodeFromJSON(json);
  const start = textRange(doc, startText);
  const end = textRange(doc, endText);
  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, start.from, end.to),
  });
}

function cursorIn(json: CmsTiptapJson, text: string) {
  const doc = schema.nodeFromJSON(json);
  const range = textRange(doc, text);
  const cursor = range.from + 1;
  return EditorState.create({
    doc,
    selection: TextSelection.create(doc, cursor),
  });
}

function sizedText(text: string, fontSize: string, fontFamily?: string) {
  return {
    type: "text",
    text,
    marks: [
      {
        type: "textStyle",
        attrs: {
          fontSize,
          ...(fontFamily ? { fontFamily } : {}),
        },
      },
    ],
  };
}

describe("cms editor active font size", () => {
  it("reports one explicit size for a selection that shares it", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [sizedText("Twenty pixels", "20px")],
        },
      ],
    };

    const inspection = inspectActiveFontSize(stateForText(json, "Twenty"));

    assert.deepEqual(inspection, { status: "size", source: "explicit", label: "20" });
    assert.equal(activeFontSizeControlText(inspection), "20");
    assert.equal(fontSizePresetIsActive(inspection, 20), true);
    assert.equal(fontSizePresetIsActive(inspection, 18), false);
  });

  it("reports Mixed when the selection contains more than one size", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [sizedText("Twenty", "20px"), sizedText("Forty", "40px")],
        },
      ],
    };

    const inspection = inspectActiveFontSize(stateForText(json, "Twenty", "Forty"));

    assert.deepEqual(inspection, { status: "mixed" });
    assert.equal(activeFontSizeControlText(inspection), CMS_FONT_SIZE_MIXED_LABEL);
    assert.equal(fontSizePresetIsActive(inspection, 20), false);
    assert.equal(fontSizePresetIsActive(inspection, 40), false);
  });

  it("reports the explicit size at a cursor inside sized text", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [sizedText("Sized heading", "20px", "var(--font-family-unna), Unna, serif")],
        },
      ],
    };

    const inspection = inspectActiveFontSize(cursorIn(json, "Sized"));

    assert.deepEqual(inspection, { status: "size", source: "explicit", label: "20" });
  });

  it("reports Inherit for a cursor in unformatted text, with the editor preview kept separate", () => {
    const paragraph: CmsTiptapJson = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Body copy" }] }],
    };
    const heading: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section" }],
        },
      ],
    };
    const display: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Display" }],
        },
      ],
    };

    const paragraphInspection = inspectActiveFontSize(cursorIn(paragraph, "Body"));
    assert.deepEqual(paragraphInspection, {
      status: "size",
      source: "inherited",
      label: CMS_FONT_SIZE_INHERIT_LABEL,
      editorLabel: CMS_EDITOR_BODY_FONT_SIZE_LABEL,
    });
    assert.equal(activeFontSizeControlText(paragraphInspection), "Inherit");
    assert.equal(activeFontSizeEditorHint(paragraphInspection), "18");
    assert.equal(fontSizeInheritIsActive(paragraphInspection), true);
    assert.equal(shouldClearExplicitFontSize(paragraphInspection), false);
    assert.equal(fontSizePresetIsActive(paragraphInspection, 18), false);

    assert.deepEqual(inspectActiveFontSize(cursorIn(heading, "Section")), {
      status: "size",
      source: "inherited",
      label: CMS_FONT_SIZE_INHERIT_LABEL,
      editorLabel: CMS_EDITOR_HEADING_FONT_SIZE_LABEL[2],
    });
    assert.deepEqual(inspectActiveFontSize(cursorIn(display, "Display")), {
      status: "size",
      source: "inherited",
      label: CMS_FONT_SIZE_INHERIT_LABEL,
      editorLabel: CMS_EDITOR_HEADING_FONT_SIZE_LABEL[1],
    });
  });

  it("keeps a selection of unformatted blocks in Inherit when their editor previews differ", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Body" }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Smaller heading" }],
        },
      ],
    };

    const inspection = inspectActiveFontSize(stateForText(json, "Body", "Smaller"));

    assert.deepEqual(inspection, {
      status: "size",
      source: "inherited",
      label: CMS_FONT_SIZE_INHERIT_LABEL,
      editorLabel: null,
    });
    assert.equal(activeFontSizeControlText(inspection), "Inherit");
    assert.equal(activeFontSizeEditorHint(inspection), null);
    assert.equal(shouldClearExplicitFontSize(inspection), false);
  });

  it("reports Mixed when inherited text is selected together with an explicit size", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Plain" }, sizedText("Twenty", "20px")],
        },
      ],
    };

    const inspection = inspectActiveFontSize(stateForText(json, "Plain", "Twenty"));

    assert.equal(inspection.status, "mixed");
    assert.equal(shouldClearExplicitFontSize(inspection), true);
    assert.equal(fontSizePresetIsActive(inspection, 20), false);
  });

  it("uses a stored font size at a collapsed cursor after formatting is applied", () => {
    const json: CmsTiptapJson = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Plain" }] }],
    };
    const base = cursorIn(json, "Plain");
    const mark = schema.marks.textStyle.create({ fontSize: "20px" });
    const state = base.apply(base.tr.setStoredMarks([mark]));

    const inspection = inspectActiveFontSize(state);
    assert.deepEqual(inspection, {
      status: "size",
      source: "explicit",
      label: "20",
    });
    assert.equal(shouldClearExplicitFontSize(inspection), true);
  });

  it("keeps an empty paragraph on the body default", () => {
    const state = documentState({ type: "doc", content: [{ type: "paragraph" }] }, 1);

    const before = state.doc.toJSON();
    const inspection = inspectActiveFontSize(state);

    assert.deepEqual(inspection, {
      status: "size",
      source: "inherited",
      label: CMS_FONT_SIZE_INHERIT_LABEL,
      editorLabel: "18",
    });
    assert.deepEqual(state.doc.toJSON(), before);
  });
});

describe("cms font size serialization", () => {
  it("publishes a size of 20px without converting it to 40px", () => {
    const document: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            sizedText("Fraunces twenty", "20px", "var(--font-family-display), Fraunces, serif"),
            sizedText(" Unna twenty", "20px", "var(--font-family-unna), Unna, serif"),
          ],
        },
      ],
    };

    const html = tiptapJsonToHtml(document);
    const inline = getPublishedCmsFieldHtml({ "hero.headline": document }, "hero.headline", "inline");

    assert.match(html, /font-size:\s*20px/i);
    assert.doesNotMatch(html, /40px/);
    assert.match(html, /var\(--font-family-display\), Fraunces, serif/);
    assert.match(html, /var\(--font-family-unna\), Unna, serif/);
    assert.match(inline ?? "", /font-size:\s*20px/i);
    assert.doesNotMatch(inline ?? "", /40px/);
  });

  it("leaves unformatted text without a font-size mark", () => {
    const document: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Section copy" }],
        },
      ],
    };

    const html = tiptapJsonToHtml(document);
    assert.doesNotMatch(html, /font-size/i);
    assert.equal(shouldClearExplicitFontSize(inspectActiveFontSize(stateForText(document, "Section"))), false);
  });
});
