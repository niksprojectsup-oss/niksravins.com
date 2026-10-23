import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bookingSuccessPath } from "@/lib/booking/booking-success-path";
import { LOCALES, LOCALE_DEFINITIONS } from "@/lib/i18n/config";
import { parseLocaleParam } from "@/lib/i18n/locales";
import { buildLanguageAlternates, buildPublicMetadata } from "@/lib/seo/metadata";
import {
  getLocaleFromPathname,
  getPublishedLocalesForPage,
  localizedPath,
  stripLocalePrefix,
} from "./paths";

describe("i18n paths", () => {
  it("localizedPath keeps English at root", () => {
    assert.equal(localizedPath("en", ""), "/");
    assert.equal(localizedPath("en", "book"), "/book");
    assert.equal(localizedPath("en", "legal"), "/legal");
  });

  it("localizedPath prefixes non-English locales", () => {
    assert.equal(localizedPath("de", ""), "/de");
    assert.equal(localizedPath("de", "book"), "/de/book");
    assert.equal(localizedPath("ja", ""), "/ja");
    assert.equal(localizedPath("zh", "book"), "/zh/book");
    assert.equal(localizedPath("de", "legal"), "/de/legal");
    assert.equal(localizedPath("lv", ""), "/lv");
    assert.equal(localizedPath("lv", "book"), "/lv/book");
    assert.equal(localizedPath("lv", "legal"), "/lv/legal");
  });

  it("stripLocalePrefix removes locale segment", () => {
    assert.equal(stripLocalePrefix("/de/legal"), "/legal");
    assert.equal(stripLocalePrefix("/de/book"), "/book");
    assert.equal(stripLocalePrefix("/fr"), "/");
    assert.equal(stripLocalePrefix("/book"), "/book");
    assert.equal(stripLocalePrefix("/"), "/");
    assert.equal(stripLocalePrefix("/lv/book"), "/book");
    assert.equal(stripLocalePrefix("/lv/legal"), "/legal");
  });

  it("getLocaleFromPathname detects locale from path", () => {
    assert.equal(getLocaleFromPathname("/de/book"), "de");
    assert.equal(getLocaleFromPathname("/ja"), "ja");
    assert.equal(getLocaleFromPathname("/book"), "en");
    assert.equal(getLocaleFromPathname("/"), "en");
    assert.equal(getLocaleFromPathname("/lv"), "lv");
    assert.equal(getLocaleFromPathname("/lv/legal"), "lv");
  });

  it("parses Latvian as a public locale and keeps English unprefixed", () => {
    assert.equal(parseLocaleParam("lv"), "lv");
    assert.equal(parseLocaleParam("de"), "de");
    assert.equal(parseLocaleParam("en"), null);
    assert.ok(LOCALES.includes("lv"));
    assert.equal(LOCALE_DEFINITIONS.lv.hreflang, "lv");
  });

  it("keeps booking return paths on the selected locale", () => {
    assert.equal(bookingSuccessPath("en"), "/book/success");
    assert.equal(bookingSuccessPath("de"), "/de/book/success");
    assert.equal(bookingSuccessPath("lv"), "/lv/book/success");
  });

  it("includes Latvian in metadata alternates without changing English canonicals", () => {
    const languages = buildLanguageAlternates("book");
    assert.equal(languages.lv?.endsWith("/lv/book"), true);
    assert.equal(languages.en?.endsWith("/book"), true);
    assert.equal(languages.de?.endsWith("/de/book"), true);
    assert.ok(getPublishedLocalesForPage("").includes("lv"));

    const english = buildPublicMetadata({
      locale: "en",
      page: "legal",
      title: "Legal",
      description: "Legal",
    });
    const latvian = buildPublicMetadata({
      locale: "lv",
      page: "legal",
      title: "Juridiskā informācija",
      description: "Juridiskā informācija",
    });

    assert.equal(String(english.alternates?.canonical).endsWith("/legal"), true);
    assert.equal(String(latvian.alternates?.canonical).endsWith("/lv/legal"), true);
  });
});
