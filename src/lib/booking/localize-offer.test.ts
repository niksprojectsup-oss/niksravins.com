import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicContent } from "@/content/i18n";
import { LOCALES } from "@/lib/i18n/config";
import { applyOfferTranslations } from "./localize-offer";
import type { BookableService } from "./types";

const englishOffer: BookableService = {
  id: "initial-aap-session",
  slug: "initial-aap-session",
  title: "45-minute Initial Session",
  description: "English description",
  kind: "single-session",
  offerType: "SINGLE_SESSION",
  durationLabel: "45 minutes",
  durationMinutes: 45,
  priceLabel: "€90",
  priceCents: 9000,
  currency: "EUR",
  requiresStartDate: false,
};

describe("offer localization", () => {
  it("overlays translated copy without changing ids, prices, or booking fields", () => {
    const german = getPublicContent("de").bookingOffers;
    const [localized] = applyOfferTranslations([englishOffer], german);

    assert.equal(localized.id, "initial-aap-session");
    assert.equal(localized.slug, "initial-aap-session");
    assert.equal(localized.priceCents, 9000);
    assert.equal(localized.currency, "EUR");
    assert.equal(localized.durationMinutes, 45);
    assert.equal(localized.requiresStartDate, false);
    assert.equal(localized.title, german["initial-aap-session"]?.title);
    assert.notEqual(localized.title, englishOffer.title);
  });

  it("leaves unknown offers in the source language", () => {
    const custom: BookableService = { ...englishOffer, id: "custom-offer" };
    const [localized] = applyOfferTranslations([custom], getPublicContent("de").bookingOffers);
    assert.equal(localized.title, custom.title);
  });

  it("translates default offer titles in every non-English locale", () => {
    const english = getPublicContent("en");

    for (const locale of LOCALES) {
      if (locale === "en") continue;
      const content = getPublicContent(locale);
      const initial = content.bookingOffers["initial-aap-session"];
      const pack = content.bookingOffers["aap-transformation-package"];
      assert.ok(initial);
      assert.ok(pack);
      assert.notEqual(initial.title, english.bookingOffers["initial-aap-session"]?.title);
      assert.notEqual(pack.title, english.bookingOffers["aap-transformation-package"]?.title);
      assert.match(initial.priceLabel ?? "", /€90/);
      assert.match(pack.priceLabel ?? "", /€450/);
    }
  });
});
