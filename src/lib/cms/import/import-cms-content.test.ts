import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enContent } from "@/content/i18n/en";
import {
  buildAllCmsImportFieldValues,
  buildCmsImportFieldValues,
  type CmsImportContent,
} from "@/lib/cms/import/content-sources";
import { importCmsContentFromI18n, planCmsImportField } from "@/lib/cms/import/import-cms-content";
import {
  faqAnswerToTiptapDocument,
  isEmptyCmsTiptapDocument,
  plainStringToTiptapDocument,
  plainStringsToTiptapDocument,
} from "@/lib/cms/import/tiptap-builders";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";

const sampleContent = enContent as CmsImportContent;

describe("cms import tiptap builders", () => {
  it("converts a plain string into a valid Tiptap document", () => {
    const doc = plainStringToTiptapDocument("Hello CMS");
    assert.equal(doc.type, "doc");
    assert.equal(doc.content?.[0]?.type, "paragraph");
    assert.equal(doc.content?.[0]?.attrs?.textAlign, null);
    assert.equal(doc.content?.[0]?.content?.[0]?.text, "Hello CMS");
  });

  it("converts multiline content into multiple paragraph nodes", () => {
    const doc = plainStringsToTiptapDocument(["First paragraph", "Second paragraph"]);
    assert.equal(doc.content?.length, 2);
    assert.equal(doc.content?.[0]?.content?.[0]?.text, "First paragraph");
    assert.equal(doc.content?.[1]?.content?.[0]?.text, "Second paragraph");
  });

  it("converts FAQ answers with multiple paragraphs", () => {
    const doc = faqAnswerToTiptapDocument(["Line one", "Line two"]);
    assert.equal(doc.content?.length, 2);
    assert.match(tiptapJsonToPlainText(doc), /Line one/);
    assert.match(tiptapJsonToPlainText(doc), /Line two/);
  });
});

describe("cms import content mapping", () => {
  it("maps homepage fields using CMS definition keys", () => {
    const values = buildCmsImportFieldValues(sampleContent, "home");
    const headline = values.find((entry) => entry.fieldKey === "hero.headline");
    assert.ok(headline);
    assert.match(tiptapJsonToPlainText(headline.draftJson), /You understand the reaction/);
  });

  it("maps standalone AAP body from existing public copy", () => {
    const values = buildCmsImportFieldValues(sampleContent, "aap");
    const body = values.find((entry) => entry.fieldKey === "body");
    assert.ok(body);
    assert.match(tiptapJsonToPlainText(body.draftJson), /Adaptive Association Processing \(AAP\)/);
    assert.match(tiptapJsonToPlainText(body.draftJson), /What happens in a session/);
  });
});

describe("cms import safety", () => {
  it("preserves existing non-empty CMS content", () => {
    const planned = planCmsImportField({
      field: {
        pageSlug: "aap",
        sectionKey: "main",
        fieldKey: "body",
        draftJson: plainStringToTiptapDocument("Imported body"),
      },
      locale: "en",
      existingItem: {
        draftJson: plainStringToTiptapDocument("Existing draft"),
        publishedJson: null,
      },
    });

    assert.equal(planned.action, "skipped_existing");
  });

  it("preserves existing published content when draft is empty", () => {
    const planned = planCmsImportField({
      field: {
        pageSlug: "aap",
        sectionKey: "main",
        fieldKey: "body",
        draftJson: plainStringToTiptapDocument("Imported body"),
      },
      locale: "en",
      existingItem: {
        draftJson: { type: "doc", content: [{ type: "paragraph", attrs: { textAlign: null } }] },
        publishedJson: plainStringToTiptapDocument("Published body"),
      },
    });

    assert.equal(planned.action, "skipped_existing");
  });

  it("treats empty paragraph drafts as importable", () => {
    assert.equal(
      isEmptyCmsTiptapDocument({
        type: "doc",
        content: [{ type: "paragraph", attrs: { textAlign: null } }],
      }),
      true,
    );
  });
});

describe("cms import idempotency", () => {
  it("imports only empty fields and skips populated fields on subsequent runs", async () => {
    const section = {
      id: "section-main",
      key: "main",
      title: "Main content",
      sortOrder: 0,
      items: [] as Array<{
        locale: string;
        fieldKey: string;
        draftJson: unknown;
        publishedJson: unknown | null;
      }>,
    };

    const pages = [
      {
        id: "page-aap",
        slug: "aap",
        sections: [section],
      },
    ];

    const prisma = {
      cmsPage: {
        findUnique: async ({ where }: { where: { slug: string } }) =>
          pages.find((page) => page.slug === where.slug) ?? null,
      },
      cmsSection: {
        create: async ({
          data,
        }: {
          data: { pageId: string; key: string; title: string; sortOrder: number };
        }) => ({
          id: "created-section",
          ...data,
          items: section.items,
        }),
      },
      cmsContentItem: {
        upsert: async ({
          where,
          create,
          update,
        }: {
          where: { sectionId_locale_fieldKey: { sectionId: string; locale: string; fieldKey: string } };
          create: {
            locale: string;
            fieldKey: string;
            draftJson: unknown;
            plainText: string | null;
          };
          update: { draftJson: unknown; plainText: string | null };
        }) => {
          const { locale, fieldKey } = where.sectionId_locale_fieldKey;
          const payload = section.items.some(
            (item) => item.locale === locale && item.fieldKey === fieldKey,
          )
            ? update
            : create;
          const existing = section.items.find(
            (item) => item.locale === locale && item.fieldKey === fieldKey,
          );

          if (existing) {
            existing.draftJson = payload.draftJson;
            existing.publishedJson = null;
          } else {
            section.items.push({
              locale,
              fieldKey,
              draftJson: payload.draftJson,
              publishedJson: null,
            });
          }

          return payload;
        },
      },
    };

    const loadLocaleContent = async (locale: "en" | "lv") =>
      locale === "en" ? sampleContent : null;
    const seedPages = async () => {};

    const firstRun = await importCmsContentFromI18n({
      prisma: prisma as never,
      loadLocaleContent,
      seedPages,
    });

    assert.equal(firstRun.fieldsImported, 1);

    const secondRun = await importCmsContentFromI18n({
      prisma: prisma as never,
      loadLocaleContent,
      seedPages,
    });

    assert.equal(secondRun.fieldsImported, 0);
    assert.equal(secondRun.fieldsSkippedExisting, 1);
  });
});
