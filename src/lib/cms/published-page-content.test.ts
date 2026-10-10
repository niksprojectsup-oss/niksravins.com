import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enContent } from "@/content/i18n/en";
import {
  buildPublishedCmsHtmlFields,
  getPublishedCmsFieldHtml,
} from "@/lib/cms/published-field-html";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import { tiptapImageDocument } from "@/lib/cms/import/tiptap-builders";
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
      "journey.change.0": createEmptyTiptapDocument("Maybe it is your relationship."),
      "alignment.0.title": createEmptyTiptapDocument("Your relationship."),
      "hero.explanation.0": createEmptyTiptapDocument("Automatic emotional reactions can continue"),
    });

    assert.match(htmlFields["hero.headline"] ?? "", /CMS homepage headline/);
    assert.match(htmlFields["journey.change.0"] ?? "", /Maybe it is your relationship/);
    assert.match(htmlFields["journey.change.0"] ?? "", /^<p>/);
    assert.match(htmlFields["alignment.0.title"] ?? "", /Your relationship/);
    assert.equal(htmlFields["hero.explanation.0"], undefined);
    assert.equal(htmlFields["about.title"], undefined);
    assert.equal(htmlFields["foundation.intro"], undefined);
  });

  it("includes published foundation copy with bold emphasis", () => {
    const htmlFields = buildPublishedCmsHtmlFields({
      "foundation.intro": {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "I work with the " },
              {
                type: "text",
                text: "deeper emotional connections",
                marks: [{ type: "bold" }],
              },
            ],
          },
        ],
      },
      "foundation.headline": {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Change the inner foundation." },
              { type: "hardBreak" },
              {
                type: "text",
                text: "Create space for a different life.",
                marks: [{ type: "bold" }],
              },
            ],
          },
        ],
      },
    });

    assert.match(htmlFields["foundation.intro"] ?? "", /<strong[^>]*>deeper emotional connections<\/strong>/);
    assert.match(htmlFields["foundation.headline"] ?? "", /<strong[^>]*>Create space for a different life\.<\/strong>/);
    assert.doesNotMatch(htmlFields["foundation.headline"] ?? "", /^<p>/);
  });

  it("includes published identity shift copy in the homepage html field map", () => {
    const htmlFields = buildPublishedCmsHtmlFields({
      "identityShifts.heading": createEmptyTiptapDocument("Change at the level of identity"),
      "identityShifts.intro": createEmptyTiptapDocument(
        "Sometimes what holds you back isn’t the situation itself.",
      ),
      "identityShifts.rows.0.from": createEmptyTiptapDocument("I’m not good enough."),
      "identityShifts.rows.0.explanation": createEmptyTiptapDocument(
        "You may constantly prove yourself.",
      ),
      "identityShifts.rows.0.to": createEmptyTiptapDocument("I am enough."),
      "identityShifts.closingLead": createEmptyTiptapDocument(
        "These beliefs don’t always sound like thoughts in your head.",
      ),
      "identityShifts.closing": createEmptyTiptapDocument(
        "Sometimes they show up as the choices you make.",
      ),
    });

    assert.match(htmlFields["identityShifts.heading"] ?? "", /Change at the level of identity/);
    assert.doesNotMatch(htmlFields["identityShifts.heading"] ?? "", /^<p>/);
    assert.match(htmlFields["identityShifts.intro"] ?? "", /^<p>/);
    assert.match(htmlFields["identityShifts.rows.0.from"] ?? "", /I’m not good enough/);
    assert.match(htmlFields["identityShifts.rows.0.explanation"] ?? "", /^<p>/);
    assert.match(htmlFields["identityShifts.rows.0.to"] ?? "", /I am enough/);
    assert.match(htmlFields["identityShifts.closing"] ?? "", /choices you make/);
  });

  it("includes published roots copy in the homepage html field map", () => {
    const htmlFields = buildPublishedCmsHtmlFields({
      "roots.intro": createEmptyTiptapDocument(
        "We work with the beliefs and emotional associations underneath it.",
      ),
      "roots.headline": createEmptyTiptapDocument(
        "When the inner foundation changes, the way you move through life can change with it.",
      ),
    });

    assert.match(htmlFields["roots.intro"] ?? "", /^<p>/);
    assert.match(htmlFields["roots.intro"] ?? "", /beliefs and emotional associations/);
    assert.match(htmlFields["roots.headline"] ?? "", /When the inner foundation changes/);
    assert.doesNotMatch(htmlFields["roots.headline"] ?? "", /^<p>/);
  });

  it("keeps a published image field when the document has no text", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "underneath.image",
          draftJson: tiptapImageDocument("/cms-uploads/underneath.jpg"),
          publishedJson: tiptapImageDocument("/cms-uploads/underneath.jpg"),
          plainText: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["underneath.image"],
    });

    assert.equal(fields["underneath.image"]?.content?.[0]?.attrs?.src, "/cms-uploads/underneath.jpg");
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
