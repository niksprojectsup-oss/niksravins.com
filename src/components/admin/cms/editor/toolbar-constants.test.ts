import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CMS_FONT_FAMILIES,
  cmsFontFamilyOption,
} from "@/components/admin/cms/editor/toolbar-constants";
import { serializeCmsFieldsForAction } from "@/lib/cms/tiptap";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";

const existingFamilies = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "System UI", value: "system-ui, sans-serif" },
] as const;

function frauncesOption() {
  return CMS_FONT_FAMILIES.find((entry) => entry.label === "Fraunces");
}

function styledDocument(fontFamily: string): CmsTiptapJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Personīgā transformācija",
            marks: [{ type: "textStyle", attrs: { fontFamily } }],
          },
        ],
      },
    ],
  };
}

describe("cms editor font families", () => {
  it("adds Fraunces using the loaded next/font display variable, without replacing existing options", () => {
    const fraunces = frauncesOption();

    assert.equal(CMS_FONT_FAMILIES[0].label, "Inter");
    assert.ok(fraunces);
    assert.equal(fraunces.value, "var(--font-family-display), Fraunces, serif");
    assert.match(fraunces.value, /var\(--font-family-display\)/);
    assert.doesNotMatch(fraunces.value, /--font-fraunces|--font-family-fraunces/);

    for (const family of existingFamilies) {
      assert.deepEqual(
        CMS_FONT_FAMILIES.find((entry) => entry.label === family.label),
        family,
      );
    }
  });

  it("keeps the Fraunces menu selection when the stored value matches the option", () => {
    const fraunces = frauncesOption();
    assert.ok(fraunces);
    assert.equal(cmsFontFamilyOption(fraunces.value).label, "Fraunces");
    assert.equal(cmsFontFamilyOption(undefined).label, "Inter");
    assert.equal(cmsFontFamilyOption("Georgia, serif").label, "Georgia");
  });

  it("persists Fraunces in CMS HTML and in the JSON that reopens the editor", () => {
    const fraunces = frauncesOption();
    assert.ok(fraunces);

    const document = styledDocument(fraunces.value);
    const html = tiptapJsonToHtml(document);
    const reopened = serializeCmsFieldsForAction({ "hero.headline": document });
    const storedFamily = (
      reopened["hero.headline"] as CmsTiptapJson
    ).content?.[0] as { content?: Array<{ marks?: Array<{ attrs?: { fontFamily?: string } }> }> };

    assert.match(html, /font-family:\s*var\(--font-family-display\),\s*Fraunces,\s*serif/);
    assert.equal(storedFamily.content?.[0]?.marks?.[0]?.attrs?.fontFamily, fraunces.value);
    assert.equal(
      cmsFontFamilyOption(storedFamily.content?.[0]?.marks?.[0]?.attrs?.fontFamily).label,
      "Fraunces",
    );
  });
});
