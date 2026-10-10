import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFilePublicContent } from "@/content/i18n";
import {
  buildTranslationCatalog,
  classifyTranslationKey,
  extractPlaceholders,
  flattenPublicContent,
  isProtectedTranslationKey,
  keysForNewListItem,
  nextListIndex,
  placeholdersMatch,
} from "@/lib/i18n/translation-catalog";
import { LOCALES } from "@/lib/i18n/config";
import { TRANSLATION_LOCALES } from "@/lib/i18n/translation-locales";

describe("translation catalog", () => {
  it("covers public user-facing strings and skips functional identifiers", () => {
    const catalog = buildTranslationCatalog();
    const keys = new Set(catalog.map((entry) => entry.key));

    assert.ok(keys.has("hero.headline"));
    assert.ok(keys.has("navigation.0.label"));
    assert.ok(keys.has("faq.items.0.question"));
    assert.ok(keys.has("bookingUi.validation.emailRequired"));
    assert.ok(keys.has("bookingUi.paymentSuccess.title"));
    assert.ok(keys.has("bookingUi.form.countries.0.label"));
    assert.ok(keys.has("legal.heading"));
    assert.ok(keys.has("seo.home.title"));
    assert.ok(keys.has("bookingOffers.initial-aap-session.title"));

    assert.equal(keys.has("navigation.0.href"), false);
    assert.equal(keys.has("hero.primaryCta.href"), false);
    assert.equal(keys.has("site.bookingUrl"), false);
    assert.equal(keys.has("locale"), false);
    assert.equal(keys.has("bookingUi.form.countries.0.value"), false);
    assert.equal(keys.has("foundation.intro.0.bold"), false);
  });

  it("classifies keys by page and section", () => {
    assert.deepEqual(classifyTranslationKey("hero.headline"), { page: "home", section: "hero" });
    assert.deepEqual(classifyTranslationKey("bookingUi.validation.emailRequired"), {
      page: "book",
      section: "validation",
    });
    assert.deepEqual(classifyTranslationKey("legal.body"), { page: "legal", section: "legal" });
    assert.deepEqual(classifyTranslationKey("header.book"), { page: "shared", section: "header" });
    assert.deepEqual(classifyTranslationKey("seo.legal.title"), { page: "legal", section: "seo" });
  });

  it("protects routes, anchors, and canonical option values", () => {
    assert.equal(isProtectedTranslationKey("hero.secondaryCta.href"), true);
    assert.equal(isProtectedTranslationKey("bookingUi.form.timezones.2.value"), true);
    assert.equal(isProtectedTranslationKey("hero.secondaryCta.label"), false);
  });

  it("preserves interpolation placeholders", () => {
    assert.deepEqual(extractPlaceholders("Times ({timezone})."), ["{timezone}"]);
    assert.equal(placeholdersMatch("Times ({timezone}).", "Zeiten ({timezone})."), true);
    assert.equal(placeholdersMatch("Times ({timezone}).", "Zeiten."), false);
  });

  it("allocates new keys inside existing list sections", () => {
    assert.equal(nextListIndex(["faq.items.0.question", "faq.items.1.answer"], "faq.items"), 2);
    assert.deepEqual(keysForNewListItem("faq.items", 2), [
      "faq.items.2.question",
      "faq.items.2.answer",
    ]);
  });

  it("includes every public locale plus Latvian for admin editing", () => {
    assert.deepEqual([...TRANSLATION_LOCALES], ["en", "lv", "de", "fr", "es", "it", "ja", "zh"]);
    for (const locale of LOCALES) {
      assert.ok(Object.keys(flattenPublicContent(getFilePublicContent(locale))).length > 100);
    }
  });
});
