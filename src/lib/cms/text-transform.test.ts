import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Editor } from "@tiptap/core";
import { getCmsEditorExtensions } from "@/lib/cms/tiptap";
import { applyCmsTextTransform, CMS_TEXT_TRANSFORM_VALUES } from "@/lib/cms/tiptap-text-controls";
import { serializeCmsFieldsForAction } from "@/lib/cms/tiptap";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";

function editorWithSelection() {
  const editor = new Editor({
    extensions: getCmsEditorExtensions(),
    content: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }],
    },
  });
  editor.commands.setTextSelection({ from: 1, to: 6 });
  editor.chain().setMark("textStyle", { fontSize: "36px" }).run();
  return editor;
}

function savedHtml(editor: Editor) {
  const saved = serializeCmsFieldsForAction({
    "journey.heading": editor.getJSON() as CmsTiptapJson,
  });
  return tiptapJsonToHtml(saved["journey.heading"]);
}

describe("cms text transform", () => {
  it("registers a chain command and does not require a built-in setTextTransform", () => {
    const editor = editorWithSelection();
    const chain = editor.chain().focus();
    assert.equal(typeof chain.setMark, "function");
    assert.equal(typeof chain.setTextTransform, "function");
    assert.equal(typeof chain.unsetTextTransform, "function");
    editor.destroy();
  });

  for (const value of CMS_TEXT_TRANSFORM_VALUES) {
    it(`saves and publishes text-transform: ${value} without dropping the font size`, () => {
      const editor = editorWithSelection();
      assert.equal(applyCmsTextTransform(editor, value), true);
      const html = savedHtml(editor);
      assert.match(html, new RegExp(`text-transform:\\s*${value}`));
      assert.match(html, /font-size:\s*36px/);
      editor.destroy();
    });
  }

  it("clears only the explicit text-transform and leaves the font size in the saved document", () => {
    const editor = editorWithSelection();
    applyCmsTextTransform(editor, "uppercase");
    assert.equal(applyCmsTextTransform(editor, null), true);

    const html = savedHtml(editor);
    assert.match(html, /font-size:\s*36px/);
    assert.doesNotMatch(html, /text-transform/);

    const mark = editor.getJSON().content?.[0]?.content?.[0]?.marks?.[0];
    assert.equal(mark?.type, "textStyle");
    assert.equal(mark?.attrs?.fontSize, "36px");
    assert.equal(mark?.attrs?.textTransform, null);
    editor.destroy();
  });
});
