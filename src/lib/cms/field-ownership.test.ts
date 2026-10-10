import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEmptyTiptapDocument } from "@/lib/cms/tiptap";
import {
  cmsEditorPathForKey,
  getFieldOwner,
  isCmsOwnedCatalogKey,
  isCmsOwnedFieldKey,
} from "@/lib/cms/field-ownership";
import { cmsHtmlFieldsForRequestedLocale } from "@/lib/cms/locale-render";
import { CMS_IMPORT_LOCALES, CMS_LOCALES } from "@/lib/cms/definitions";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import { applyEnglishCatalogFallback, applyPublishedOverlay } from "@/lib/i18n/translation-overlay";
import { applyLocalizedPaths, getFilePublicContent } from "@/content/i18n";

describe("field ownership", () => {
  it("marks homepage and legal body fields as CMS-owned", () => {
    assert.equal(getFieldOwner("hero.headline"), "cms");
    assert.equal(getFieldOwner("faq.items.0.question"), "cms");
    assert.equal(getFieldOwner("journey.change.0"), "cms");
    assert.equal(getFieldOwner("alignment.0.title"), "cms");
    assert.equal(getFieldOwner("legal.body"), "cms");
    assert.equal(isCmsOwnedFieldKey("foundation.image"), true);
    assert.equal(cmsEditorPathForKey("legal.body"), "/admin/content/legal");
    assert.equal(cmsEditorPathForKey("hero.headline"), "/admin/content/home");
  });

  it("keeps catalog ownership for chrome, booking, and legal labels", () => {
    assert.equal(getFieldOwner("legal.heading"), "catalog");
    assert.equal(getFieldOwner("legal.contactLabel"), "catalog");
    assert.equal(getFieldOwner("header.book"), "catalog");
    assert.equal(getFieldOwner("navigation.0.label"), "catalog");
    assert.equal(getFieldOwner("bookingUi.validation.emailRequired"), "catalog");
    assert.equal(getFieldOwner("journey.heading"), "catalog");
    assert.equal(isCmsOwnedCatalogKey("hero.explanation.0"), false);
  });
});

describe("locale-specific CMS rendering", () => {
  it("never applies English CMS HTML to another locale", () => {
    const englishPublished = {
      locale: "en" as const,
      fields: {
        "hero.headline": createEmptyTiptapDocument("English CMS headline"),
      },
    };

    const germanHtml = cmsHtmlFieldsForRequestedLocale("de", englishPublished);
    const englishHtml = cmsHtmlFieldsForRequestedLocale("en", englishPublished);

    assert.deepEqual(germanHtml, {});
    assert.match(englishHtml["hero.headline"] ?? "", /English CMS headline/);
  });

  it("uses empty CMS fields as a catalog fallback for that locale", () => {
    const html = cmsHtmlFieldsForRequestedLocale("fr", { locale: "fr", fields: {} });
    assert.deepEqual(html, {});

    const french = applyLocalizedPaths(getFilePublicContent("fr"), "fr");
    assert.notEqual(french.hero.headline, getFilePublicContent("en").hero.headline);
  });

  it("reads only the requested locale from published CMS items", () => {
    const fields = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      locale: "de",
      fieldKeys: ["hero.headline"],
      items: [
        {
          id: "en",
          sectionId: "s1",
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("EN draft"),
          publishedJson: createEmptyTiptapDocument("English CMS headline"),
          plainText: "English CMS headline",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "de",
          sectionId: "s1",
          locale: "de",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("DE draft"),
          publishedJson: null,
          plainText: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    assert.deepEqual(fields, {});
  });

  it("falls back to English catalog when a locale key is missing", () => {
    const german = applyPublishedOverlay(getFilePublicContent("de"), {});
    german.header.book = "";
    const merged = applyEnglishCatalogFallback(german, getFilePublicContent("en"));
    assert.equal(merged.header.book, "Book");
    assert.notEqual(merged.hero.headline, getFilePublicContent("en").hero.headline);
  });

  it("does not import-create CMS rows for public locales automatically", () => {
    assert.deepEqual([...CMS_IMPORT_LOCALES], ["en", "lv"]);
    assert.equal(CMS_LOCALES.includes("de"), true);
  });
});
