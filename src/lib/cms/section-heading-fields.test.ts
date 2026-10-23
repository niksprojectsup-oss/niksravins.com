import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { lvContent } from "@/content/i18n/lv";
import { withCatalogSectionHeadingDrafts } from "@/lib/cms/build-locale-cms-fields";
import { buildPublishedCmsHtmlFields, getPublishedCmsFieldHtml } from "@/lib/cms/published-field-html";
import type { CmsPageContent } from "@/lib/cms/types";

const globalsCss = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

function emptyHomePage(): CmsPageContent {
  return {
    slug: "home",
    title: "Home",
    status: "DRAFT",
    locale: "lv",
    updatedAt: "2026-10-15T00:00:00.000Z",
    sections: [
      {
        key: "journey",
        title: "Journey",
        sortOrder: 2,
        fields: [
          {
            fieldKey: "journey.heading",
            draftJson: null,
            publishedJson: null,
            plainText: null,
            updatedAt: "2026-10-15T00:00:00.000Z",
          },
        ],
      },
    ],
  };
}

describe("homepage section headings", () => {
  it("prefills an empty editor draft from the locale catalog without touching a saved draft", () => {
    const filled = withCatalogSectionHeadingDrafts(emptyHomePage(), lvContent);
    const heading = filled.sections[0]?.fields[0];
    assert.equal(heading?.plainText, lvContent.journey.heading);
    assert.equal(heading?.publishedJson, null);

    const saved = emptyHomePage();
    saved.sections[0]!.fields[0]!.draftJson = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Saved heading" }] }],
    };
    const unchanged = withCatalogSectionHeadingDrafts(saved, lvContent);
    assert.equal(unchanged.sections[0]?.fields[0]?.draftJson?.content?.[0]?.content?.[0]?.text, "Saved heading");
  });

  it("publishes an explicit 20px mark as font-size: 20px", () => {
    const html = getPublishedCmsFieldHtml(
      {
        "journey.heading": {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: lvContent.journey.heading,
                  marks: [{ type: "textStyle", attrs: { fontSize: "20px" } }],
                },
              ],
            },
          ],
        },
      },
      "journey.heading",
      "block",
    );

    assert.match(html ?? "", /font-size:\s*20px/);
    assert.doesNotMatch(html ?? "", /font-size:\s*40px/);

    const htmlFields = buildPublishedCmsHtmlFields({
      "journey.heading": {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [
              {
                type: "text",
                text: lvContent.journey.heading,
                marks: [{ type: "textStyle", attrs: { fontSize: "20px" } }],
              },
            ],
          },
        ],
      },
    });
    assert.match(htmlFields["journey.heading"] ?? "", /^<p[^>]*text-align:\s*left/);
    assert.match(htmlFields["journey.heading"] ?? "", /font-size:\s*20px/);
  });

  it("keeps section tracking as a default and lets an explicit letter-spacing win", () => {
    assert.match(globalsCss, /\.want-change-title\s*\{[^}]*--cms-tracking:\s*0\.055em;/);
    assert.match(globalsCss, /\.home-alignment-heading\s*\{[^}]*--cms-tracking:\s*0\.055em;/);
    assert.match(
      globalsCss,
      /\.cms-published-text \[style\*="font-size"\]:not\(\[style\*="letter-spacing"\]\)/,
    );
  });

  it("does not cap the Journey heading at 22em of the section font", () => {
    const title = globalsCss.match(/\.want-change-title\s*\{([^}]*)\}/)?.[1] ?? "";
    assert.match(title, /max-width:\s*100%/);
    assert.doesNotMatch(title, /max-width:\s*22em/);
    assert.doesNotMatch(title, /white-space:\s*nowrap/);
    assert.match(globalsCss, /\.home-alignment-heading\s*\{[^}]*max-width:\s*22em/);
  });
});
