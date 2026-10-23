import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CMS_FONT_FAMILIES } from "@/components/admin/cms/editor/toolbar-constants";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";

const globalsCss = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

const unna = CMS_FONT_FAMILIES.find((entry) => entry.label === "Unna");

function publishedSample(): CmsTiptapJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        attrs: { textAlign: "center" },
        content: [
          {
            type: "text",
            text: "Tu vēlies, lai kaut kas mainītos.",
            marks: [
              {
                type: "textStyle",
                attrs: {
                  fontFamily: unna?.value,
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#111111",
                  backgroundColor: "#f5f1e8",
                  letterSpacing: "0.055em",
                  lineHeight: "1.15",
                  textTransform: "uppercase",
                },
              },
              { type: "bold" },
              { type: "italic" },
            ],
          },
        ],
      },
    ],
  };
}

describe("published CMS typography", () => {
  it("writes Unna, 36px, weight, color, tracking, case, and alignment into the published HTML", () => {
    assert.ok(unna);
    const html = tiptapJsonToHtml(publishedSample());

    assert.match(html, /font-family:[^;"]*--font-family-unna/);
    assert.match(html, /font-size:\s*36px/);
    assert.match(html, /font-weight:\s*700/);
    assert.match(html, /color:\s*#111111/i);
    assert.match(html, /background-color:\s*#f5f1e8/i);
    assert.match(html, /letter-spacing:\s*0\.055em/);
    assert.match(html, /line-height:\s*1\.15/);
    assert.match(html, /text-transform:\s*uppercase/);
    assert.match(html, /text-align:\s*center/);
    assert.match(html, /<strong/);
    assert.match(html, /<em/);
    assert.doesNotMatch(html, /font-size:\s*72px/);
  });

  it("omits optional controls when the document does not set them", () => {
    const html = tiptapJsonToHtml({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Plain" }] }],
    });

    assert.doesNotMatch(html, /font-size:/);
    assert.doesNotMatch(html, /letter-spacing:/);
    assert.doesNotMatch(html, /text-transform:/);
    assert.doesNotMatch(html, /font-weight:/);
  });

  it("does not force section tracking over an explicit letter-spacing, and does not use !important", () => {
    assert.match(globalsCss, /letter-spacing:\s*var\(--cms-tracking, normal\)/);
    assert.match(globalsCss, /:not\(\[style\*="letter-spacing"\]\)/);
    assert.doesNotMatch(globalsCss, /font-size:[^;]*!important/);
    assert.doesNotMatch(globalsCss, /font-family:[^;]*!important/);
    assert.doesNotMatch(globalsCss, /letter-spacing:[^;]*!important/);
  });
});
