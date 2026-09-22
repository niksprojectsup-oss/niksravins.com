import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enContent } from "@/content/i18n/en";
import {
  buildPublishedCmsHtmlFields,
  getPublishedCmsFieldHtml,
} from "@/lib/cms/published-field-html";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import { createEmptyTiptapDocument, tiptapJsonToPlainText } from "@/lib/cms/tiptap";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import type { CmsTiptapJson } from "@/lib/cms/types";

describe("cms published page content", () => {
  it("returns published fields when page status is PUBLISHED", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "body",
          draftJson: createEmptyTiptapDocument("Draft only"),
          publishedJson: createEmptyTiptapDocument("Published body"),
          plainText: "Published body",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["body"],
    });

    assert.match(tiptapJsonToPlainText(fields.body), /Published body/);
  });

  it("does not return draft-only content when page is not published", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "DRAFT" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "body",
          draftJson: createEmptyTiptapDocument("Draft body"),
          publishedJson: null,
          plainText: "Draft body",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["body"],
    });

    assert.deepEqual(fields, {});
  });

  it("does not return draftJson even when publishedJson is missing", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "body",
          draftJson: createEmptyTiptapDocument("Draft body"),
          publishedJson: null,
          plainText: "Draft body",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["body"],
    });

    assert.deepEqual(fields, {});
  });

  it("returns null-equivalent map when published content is missing", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [],
      locale: "en",
      fieldKeys: ["body"],
    });

    assert.deepEqual(fields, {});
  });
});

describe("cms published field html", () => {
  it("resolves block and inline html for a published field", () => {
    const fields = {
      "hero.explanation.0": createEmptyTiptapDocument("Automatic emotional reactions can continue"),
    };

    const blockHtml = getPublishedCmsFieldHtml(fields, "hero.explanation.0", "block");
    const inlineHtml = getPublishedCmsFieldHtml(fields, "hero.explanation.0", "inline");

    assert.match(blockHtml ?? "", /Automatic emotional reactions/);
    assert.match(inlineHtml ?? "", /Automatic emotional reactions/);
    assert.doesNotMatch(inlineHtml ?? "", /^<p>/);
  });

  it("returns undefined when a published field is missing", () => {
    assert.equal(getPublishedCmsFieldHtml({}, "hero.headline", "inline"), undefined);
  });

  it("builds a homepage html field map from published CMS documents", () => {
    const htmlFields = buildPublishedCmsHtmlFields({
      "hero.headline": createEmptyTiptapDocument("CMS homepage headline"),
      "hero.explanation.0": createEmptyTiptapDocument("Automatic emotional reactions can continue"),
    });

    assert.match(htmlFields["hero.headline"] ?? "", /CMS homepage headline/);
    assert.match(htmlFields["hero.explanation.0"] ?? "", /Automatic emotional reactions/);
    assert.match(htmlFields["hero.explanation.0"] ?? "", /^<p>/);
    assert.equal(htmlFields["about.title"], undefined);
  });
});

describe("cms tiptap html rendering", () => {
  it("renders paragraph, heading, and bold content to HTML", () => {
    const document: CmsTiptapJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1, textAlign: null },
          content: [{ type: "text", text: "AAP heading" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: null },
          content: [
            { type: "text", text: "Intro " },
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
          ],
        },
      ],
    };

    const html = tiptapJsonToHtml(document);
    assert.match(html, /<h1[^>]*>AAP heading<\/h1>/);
    assert.match(html, /<strong[^>]*>bold<\/strong>/);
    assert.match(html, /Intro/);
  });
});

describe("cms standalone fallback behavior", () => {
  it("keeps hardcoded i18n content available when CMS fields are missing", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [],
      locale: "en",
      fieldKeys: ["body"],
    });

    assert.equal(Object.keys(fields).length, 0);
    assert.match(enContent.aap.title, /How the work happens in session/);
  });
});
