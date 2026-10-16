import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countries, timezones } from "@/content/booking";
import { getAllPublicContent, getPublicContent } from "@/content/i18n";
import { LOCALES } from "@/lib/i18n/config";

const EXPECTED_NAV_LABELS = {
  en: { explore: "Explore options", identity: "Identity Shifts" },
  lv: { explore: "Izpētīt iespējas", identity: "Identitātes pārmaiņas" },
  de: { explore: "Optionen erkunden", identity: "Identitätswandel" },
  fr: { explore: "Explorer les options", identity: "Changements identitaires" },
  es: { explore: "Explorar opciones", identity: "Cambios de identidad" },
  it: { explore: "Esplora le opzioni", identity: "Cambiamenti di identità" },
  ja: { explore: "選択肢を見る", identity: "アイデンティティの変化" },
  zh: { explore: "探索选项", identity: "身份转变" },
} as const;

describe("public content navigation", () => {
  it("localizes homepage section links for English", () => {
    const content = getPublicContent("en");

    assert.equal(content.navigation[0]?.href, "/#want-change");
    assert.equal(content.navigation[1]?.href, "/#identity-shifts");
    assert.equal(content.navigation[2]?.href, "/#faq");
    assert.equal(content.navigation[3]?.href, "/#contact");
    assert.equal(content.navigation[0]?.label, EXPECTED_NAV_LABELS.en.explore);
    assert.equal(content.navigation[1]?.label, EXPECTED_NAV_LABELS.en.identity);
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });

  it("localizes homepage section links for non-English locales", () => {
    const content = getPublicContent("de");

    assert.equal(content.navigation[0]?.href, "/de#want-change");
    assert.equal(content.navigation[1]?.href, "/de#identity-shifts");
    assert.equal(content.navigation[2]?.href, "/de#faq");
    assert.equal(content.navigation[3]?.href, "/de#contact");
    assert.equal(content.navigation[0]?.label, EXPECTED_NAV_LABELS.de.explore);
    assert.equal(content.navigation[1]?.label, EXPECTED_NAV_LABELS.de.identity);
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });

  it("translates explore and identity nav labels in every supported locale", () => {
    for (const locale of LOCALES) {
      const content = getPublicContent(locale);
      const expected = EXPECTED_NAV_LABELS[locale];

      assert.equal(content.navigation[0]?.href.endsWith("#want-change"), true);
      assert.equal(content.navigation[1]?.href.endsWith("#identity-shifts"), true);
      assert.equal(content.navigation[0]?.label, expected.explore);
      assert.equal(content.navigation[1]?.label, expected.identity);

      if (locale !== "en") {
        assert.notEqual(content.navigation[0]?.label, "Explore options");
        assert.notEqual(content.navigation[1]?.label, "Identity Shifts");
      }
    }

    assert.equal(getAllPublicContent().length, LOCALES.length);
  });
});

const ENGLISH_FALLBACKS = [
  "You understand the reaction. It still happens.",
  "You want something to change.",
  "What feels out of alignment?",
  "Change at the level of identity",
  "I’m not good enough.",
  "Book a Session",
  "First name",
  "Identity Shifts",
  "Explore options",
] as const;

describe("public content translations", () => {
  it("covers every published locale with homepage section copy", () => {
    const english = getPublicContent("en");

    for (const locale of LOCALES) {
      const content = getPublicContent(locale);

      assert.equal(content.locale, locale);
      assert.equal(content.foundation.headline.length > 0, true);
      assert.equal(content.journey.steps.length, english.journey.steps.length);
      assert.equal(content.alignment.items.length, english.alignment.items.length);
      assert.equal(content.identityShifts.rows.length, english.identityShifts.rows.length);
      assert.equal(content.faq.items.length, english.faq.items.length);
      assert.equal(content.hero.primaryCta.href.endsWith("/book") || content.hero.primaryCta.href === "/book", true);
      assert.equal(content.journey.heading.length > 0, true);
      assert.equal(content.underneath.headline.length > 0, true);
      assert.equal(content.roots.intro.length > 0, true);
      assert.equal(content.bookingUi.form.firstName.length > 0, true);
      assert.equal(content.bookingUi.validation.emailRequired.length > 0, true);
      assert.equal(content.bookingUi.calendar.weekdays.length, 7);
      assert.equal(content.header.openMenu.length > 0, true);
    }
  });

  it("does not leave English homepage or booking fallbacks in other locales", () => {
    const english = getPublicContent("en");

    for (const locale of LOCALES) {
      if (locale === "en") continue;

      const content = getPublicContent(locale);

      assert.notEqual(content.hero.headline, english.hero.headline);
      assert.notEqual(content.journey.heading, english.journey.heading);
      assert.notEqual(content.alignment.heading, english.alignment.heading);
      assert.notEqual(content.identityShifts.heading, english.identityShifts.heading);
      assert.notEqual(content.identityShifts.rows[0]?.from, english.identityShifts.rows[0]?.from);
      assert.notEqual(content.foundation.headline[0]?.text, english.foundation.headline[0]?.text);
      assert.notEqual(content.faq.items[0]?.question, english.faq.items[0]?.question);
      assert.notEqual(content.bookingUi.form.firstName, english.bookingUi.form.firstName);
      assert.notEqual(content.hero.tertiaryCta.label, "Identity Shifts");
      assert.notEqual(content.hero.secondaryCta.label, "Explore options");

      const haystack = [
        content.hero.headline,
        content.journey.heading,
        content.alignment.heading,
        content.identityShifts.heading,
        content.header.bookSession,
        content.bookingUi.form.firstName,
        content.hero.secondaryCta.label,
        content.hero.tertiaryCta.label,
      ].join(" | ");

      for (const fallback of ENGLISH_FALLBACKS) {
        assert.equal(haystack.includes(fallback), false, `${locale} still contains "${fallback}"`);
      }
    }
  });

  it("keeps homepage anchors and booking routes locale-prefixed, not translated", () => {
    for (const locale of LOCALES) {
      const content = getPublicContent(locale);
      assert.equal(content.navigation[0]?.href.endsWith("#want-change"), true);
      assert.equal(content.navigation[1]?.href.endsWith("#identity-shifts"), true);
      assert.equal(content.hero.secondaryCta.href.endsWith("#want-change"), true);
      assert.equal(content.hero.tertiaryCta.href.endsWith("#identity-shifts"), true);
      assert.match(content.site.bookingUrl, /book$/);
    }
  });

  it("keeps canonical country and timezone values while translating labels", () => {
    const english = getPublicContent("en");

    for (const locale of LOCALES) {
      const content = getPublicContent(locale);
      const countryValues = content.bookingUi.form.countries.map((entry) => entry.value);
      const timezoneValues = content.bookingUi.form.timezones.map((entry) => entry.value);

      assert.deepEqual(countryValues, [...countries]);
      assert.deepEqual(timezoneValues, timezones.map((entry) => entry.value));
      assert.equal(content.legal.heading.length > 0, true);
      assert.equal(content.bookingUi.validation.stripeCreateFailed.length > 0, true);
      assert.ok(content.bookingOffers["initial-aap-session"]);
      assert.ok(content.bookingOffers["aap-transformation-package"]);

      if (locale !== "en") {
        assert.notEqual(
          content.bookingUi.form.countries[0]?.label,
          english.bookingUi.form.countries[0]?.label,
        );
        assert.notEqual(content.legal.heading, english.legal.heading);
        assert.notEqual(
          content.bookingUi.validation.serviceUnavailable,
          english.bookingUi.validation.serviceUnavailable,
        );
      }
    }
  });
});
