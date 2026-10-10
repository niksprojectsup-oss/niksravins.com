import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyLocalizedPaths, getFilePublicContent, getPublicContent } from "@/content/i18n";
import {
  applyEnglishCatalogFallback,
  applyPublishedOverlay,
  isMissingTranslation,
  isUntranslatedFallback,
  planSeedValue,
  publishedValueFromDraft,
} from "@/lib/i18n/translation-overlay";

describe("translation overlay and fallback", () => {
  it("applies published copy without changing routes, IDs, or prices", () => {
    const overlay = {
      "hero.headline": "Geänderte Überschrift",
      "navigation.0.label": "Optionen",
      "navigation.0.href": "/hacked",
      "bookingOffers.initial-aap-session.title": "Erstsitzung",
      "legal.heading": "Rechtliches",
    };

    const merged = applyLocalizedPaths(
      applyPublishedOverlay(getFilePublicContent("de"), overlay),
      "de",
    );

    assert.equal(merged.hero.headline, "Geänderte Überschrift");
    assert.equal(merged.navigation[0]?.label, "Optionen");
    assert.equal(merged.navigation[0]?.href, "/de#want-change");
    assert.equal(merged.bookingOffers["initial-aap-session"]?.title, "Erstsitzung");
    assert.equal(merged.legal.heading, "Rechtliches");
    assert.equal(merged.hero.primaryCta.href, "/de/book");
  });

  it("falls back to English catalog when a locale string is empty", () => {
    const german = structuredClone(getFilePublicContent("de"));
    german.legal.contactLabel = "";
    const merged = applyEnglishCatalogFallback(german, getFilePublicContent("en"));
    assert.equal(merged.legal.contactLabel, getFilePublicContent("en").legal.contactLabel);
    assert.equal(merged.legal.heading, getFilePublicContent("de").legal.heading);
  });

  it("falls back to file copy when a published value is missing", () => {
    const file = getPublicContent("fr");
    const merged = applyLocalizedPaths(
      applyPublishedOverlay(getFilePublicContent("fr"), { "hero.headline": "Titre publié" }),
      "fr",
    );

    assert.equal(merged.hero.headline, "Titre publié");
    assert.equal(merged.faq.heading, file.faq.heading);
    assert.equal(merged.navigation[1]?.href, file.navigation[1]?.href);
  });

  it("can append new FAQ items from published keys", () => {
    const merged = applyPublishedOverlay(getFilePublicContent("en"), {
      "faq.items.99.question": "New question",
      "faq.items.99.answer": "New answer",
    });

    assert.equal(merged.faq.items[99]?.question, "New question");
    assert.equal(merged.faq.items[99]?.answer, "New answer");
  });

  it("saves drafts separately from published values and loads the published overlay", () => {
    const store = new Map<string, { draftValue: string; publishedValue: string | null }>();

    store.set("hero.headline", { draftValue: "Entwurf", publishedValue: null });
    assert.equal(store.get("hero.headline")?.publishedValue, null);

    const draft = store.get("hero.headline");
    assert.ok(draft);
    store.set("hero.headline", {
      draftValue: draft.draftValue,
      publishedValue: publishedValueFromDraft(draft.draftValue),
    });

    const overlay: Record<string, string> = {};
    for (const [key, value] of store) {
      if (value.publishedValue) overlay[key] = value.publishedValue;
    }

    const rendered = applyPublishedOverlay(getFilePublicContent("de"), overlay);
    assert.equal(rendered.hero.headline, "Entwurf");
  });

  it("never overwrites an existing seeded translation value", () => {
    assert.equal(planSeedValue({ draftValue: "Custom", publishedValue: "Custom" }), "skip");
    assert.equal(planSeedValue(null), "create");
  });

  it("publishes the current draft value", () => {
    assert.equal(publishedValueFromDraft("Entwurf"), "Entwurf");
  });

  it("flags missing translations and English fallbacks", () => {
    assert.equal(isMissingTranslation("de", "", ""), true);
    assert.equal(isMissingTranslation("en", "", ""), false);
    assert.equal(isUntranslatedFallback("de", "Book", "Book", "Book"), true);
    assert.equal(isUntranslatedFallback("de", "Book", "Buchen", "Buchen"), false);
  });

  it("renders file content unchanged when no overlay is published", () => {
    const file = getPublicContent("es");
    const resolved = applyLocalizedPaths(
      applyPublishedOverlay(getFilePublicContent("es"), {}),
      "es",
    );
    assert.equal(resolved.hero.headline, file.hero.headline);
    assert.equal(resolved.legal.heading, file.legal.heading);
    assert.equal(resolved.navigation[0]?.href, file.navigation[0]?.href);
  });
});
