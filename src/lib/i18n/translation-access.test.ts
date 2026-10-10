import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCanEditTranslations,
  validateTranslationDrafts,
} from "@/lib/i18n/translation-access";

describe("translation authorization and validation", () => {
  it("allows only admin roles to edit translations", () => {
    assert.doesNotThrow(() => assertCanEditTranslations("ADMIN"));
    assert.throws(() => assertCanEditTranslations("CLIENT"), /Unauthorized/);
    assert.throws(() => assertCanEditTranslations(undefined), /Unauthorized/);
  });

  it("rejects unsupported locales and protected keys", () => {
    assert.throws(
      () => validateTranslationDrafts("nope", [{ key: "hero.headline", value: "Hi" }]),
      /Unsupported translation locale/,
    );
    assert.throws(
      () =>
        validateTranslationDrafts("de", [{ key: "navigation.0.href", value: "/de#faq" }]),
      /not editable/,
    );
    assert.throws(
      () => validateTranslationDrafts("de", [{ key: "hero.headline", value: "CMS copy" }]),
      /not editable/,
    );
  });

  it("rejects unsafe HTML and missing placeholders", () => {
    assert.throws(
      () =>
        validateTranslationDrafts("de", [
          { key: "header.book", value: "<script>alert(1)</script>" },
        ]),
      /Unsafe HTML/,
    );
    assert.throws(
      () =>
        validateTranslationDrafts("de", [
          { key: "bookingUi.calendar.localTimeNote", value: "Zeiten ohne Platzhalter." },
        ]),
      /placeholders/,
    );
  });

  it("accepts a safe localized draft that keeps placeholders", () => {
    const result = validateTranslationDrafts("ja", [
      {
        key: "bookingUi.calendar.localTimeNote",
        value: "時刻は現地時間で表示されます（{timezone}）。",
      },
    ]);

    assert.equal(result.locale, "ja");
    assert.equal(result.drafts[0]?.key, "bookingUi.calendar.localTimeNote");
  });
});
