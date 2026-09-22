import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enContent } from "@/content/i18n/en";
import { buildPublishedFieldMap } from "@/lib/cms/repository";
import {
  applyCmsFieldsToHomeContent,
  applyCmsSeoFieldsToHomeContent,
  isCmsSupportedPublicLocale,
} from "@/lib/cms/merge-homepage";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import {
  buildCmsEditorFieldMap,
  createEmptyTiptapDocument,
  resolveCmsEditorDocument,
  tiptapJsonToPlainText,
} from "@/lib/cms/tiptap";
import { tiptapJsonToHtml } from "@/lib/cms/tiptap-server";
import { isCmsLocale } from "@/lib/cms/definitions";
import type { CmsPageContent } from "@/lib/cms/types";

describe("cms locale handling", () => {
  it("supports English and Latvian CMS locales", () => {
    assert.equal(isCmsLocale("en"), true);
    assert.equal(isCmsLocale("lv"), true);
    assert.equal(isCmsLocale("de"), false);
  });

  it("limits public homepage CMS merge to supported locales", () => {
    assert.equal(isCmsSupportedPublicLocale("en"), true);
    assert.equal(isCmsSupportedPublicLocale("lv"), true);
    assert.equal(isCmsSupportedPublicLocale("de"), false);
  });
});

describe("cms draft vs published behavior", () => {
  it("returns no published fields when page is draft", () => {
    const fields = buildPublishedFieldMap(
      { status: "DRAFT" },
      [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Draft headline"),
          publishedJson: createEmptyTiptapDocument("Published headline"),
          plainText: "Published headline",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      "en",
    );

    assert.deepEqual(fields, {});
  });

  it("returns published fields only for matching locale", () => {
    const fields = buildPublishedFieldMap(
      { status: "PUBLISHED" },
      [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Draft EN"),
          publishedJson: createEmptyTiptapDocument("Published EN"),
          plainText: "Published EN",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          sectionId: "s1",
          locale: "lv",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Draft LV"),
          publishedJson: createEmptyTiptapDocument("Publicēts LV"),
          plainText: "Publicēts LV",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      "en",
    );

    assert.equal(fields["hero.headline"], "Published EN");
    assert.equal(fields["hero.headline.lv"], undefined);
  });
});

describe("cms homepage published content", () => {
  it("loads published homepage fields from publishedJson only", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Draft headline"),
          publishedJson: createEmptyTiptapDocument("CMS homepage headline"),
          plainText: "CMS homepage headline",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          sectionId: "s1",
          locale: "en",
          fieldKey: "about.title",
          draftJson: createEmptyTiptapDocument("Draft about"),
          publishedJson: createEmptyTiptapDocument("CMS about title"),
          plainText: "CMS about title",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["hero.headline", "about.title"],
    });

    assert.match(tiptapJsonToPlainText(fields["hero.headline"]), /CMS homepage headline/);
    assert.match(tiptapJsonToPlainText(fields["about.title"]), /CMS about title/);
    assert.equal(fields["hero.explanation.0"], undefined);
  });

  it("renders published homepage field content to HTML with inline formatting", () => {
    const document = createEmptyTiptapDocument("CMS homepage headline");
    document.content![0]!.content = [
      { type: "text", text: "CMS " },
      { type: "text", text: "homepage", marks: [{ type: "bold" }] },
      { type: "text", text: " headline" },
    ];

    const html = tiptapJsonToHtml(document);
    assert.match(html, /<strong[^>]*>homepage<\/strong>/);
    assert.match(html, /CMS/);
  });

  it("applies published SEO fields as plain text while body fields stay in cmsFields", () => {
    const cmsFields = {
      "hero.headline": createEmptyTiptapDocument("CMS homepage headline"),
      "seo.home.title": createEmptyTiptapDocument("CMS SEO title"),
      "seo.home.description": createEmptyTiptapDocument("CMS SEO description"),
    };

    const merged = applyCmsSeoFieldsToHomeContent(enContent, cmsFields);

    assert.equal(merged.seo.home.title, "CMS SEO title");
    assert.equal(merged.seo.home.description, "CMS SEO description");
    assert.equal(merged.hero.headline, enContent.hero.headline);
    assert.match(tiptapJsonToPlainText(cmsFields["hero.headline"]), /CMS homepage headline/);
  });

  it("falls back to hardcoded homepage content when CMS fields are missing", () => {
    const merged = applyCmsSeoFieldsToHomeContent(enContent, {});

    assert.equal(merged.hero.headline, enContent.hero.headline);
    assert.equal(merged.about.title, enContent.about.title);
    assert.equal(merged.seo.home.title, enContent.seo.home.title);
  });

  it("does not expose homepage fields when CMS page is unpublished", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "DRAFT" },
      items: [
        {
          id: "1",
          sectionId: "s1",
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Draft headline"),
          publishedJson: createEmptyTiptapDocument("Published headline"),
          plainText: "Published headline",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      locale: "en",
      fieldKeys: ["hero.headline"],
    });

    assert.deepEqual(fields, {});
    assert.equal(enContent.hero.headline.length > 0, true);
  });
});

describe("cms homepage merge (legacy plain text)", () => {
  it("applies published CMS values onto the existing homepage content", () => {
    const merged = applyCmsFieldsToHomeContent(enContent, {
      "hero.headline": "CMS headline",
      "about.title": "CMS about title",
      "faq.items.0.question": "CMS question",
      "faq.items.0.answer": "CMS answer",
    });

    assert.equal(merged.hero.headline, "CMS headline");
    assert.equal(merged.about.title, "CMS about title");
    assert.equal(merged.faq.items[0]?.question, "CMS question");
    assert.equal(merged.faq.items[0]?.answer, "CMS answer");
  });

  it("falls back to hardcoded content when CMS values are missing", () => {
    const merged = applyCmsFieldsToHomeContent(enContent, {});
    assert.equal(merged.hero.headline, enContent.hero.headline);
    assert.equal(merged.about.title, enContent.about.title);
  });
});

describe("cms tiptap helpers", () => {
  it("extracts plain text from tiptap JSON", () => {
    const text = tiptapJsonToPlainText(createEmptyTiptapDocument("Hello CMS"));
    assert.match(text, /Hello CMS/);
  });
});

describe("cms editor initial content", () => {
  it("prefers draftJson over publishedJson", () => {
    const doc = resolveCmsEditorDocument(
      createEmptyTiptapDocument("Draft body"),
      createEmptyTiptapDocument("Published body"),
    );
    assert.match(tiptapJsonToPlainText(doc), /Draft body/);
  });

  it("falls back to publishedJson when draft is missing", () => {
    const doc = resolveCmsEditorDocument(null, createEmptyTiptapDocument("Published body"));
    assert.match(tiptapJsonToPlainText(doc), /Published body/);
  });

  it("returns a valid empty document when both values are missing", () => {
    const doc = resolveCmsEditorDocument(null, null);
    assert.equal(doc.type, "doc");
    assert.ok(Array.isArray(doc.content));
  });

  it("builds an editor field map from loaded CMS page content", () => {
    const content: CmsPageContent = {
      slug: "aap",
      title: "AAP",
      status: "DRAFT",
      locale: "en",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          key: "main",
          title: "Main content",
          sortOrder: 0,
          fields: [
            {
              fieldKey: "body",
              draftJson: createEmptyTiptapDocument("Saved AAP body"),
              publishedJson: null,
              plainText: "Saved AAP body",
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    };

    const fields = buildCmsEditorFieldMap(content);
    assert.match(tiptapJsonToPlainText(fields.body), /Saved AAP body/);
  });

  it("preserves empty saved draft documents through the field map", () => {
    const emptySavedDraft = {
      type: "doc",
      content: [{ type: "paragraph", attrs: { textAlign: null } }],
    } as CmsPageContent["sections"][number]["fields"][number]["draftJson"];

    const content: CmsPageContent = {
      slug: "aap",
      title: "AAP",
      status: "DRAFT",
      locale: "en",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          key: "main",
          title: "Main content",
          sortOrder: 0,
          fields: [
            {
              fieldKey: "body",
              draftJson: emptySavedDraft,
              publishedJson: null,
              plainText: "",
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ],
    };

    const fields = buildCmsEditorFieldMap(content);
    assert.equal(fields.body?.type, "doc");
    assert.equal(tiptapJsonToPlainText(fields.body), "");
  });
});
