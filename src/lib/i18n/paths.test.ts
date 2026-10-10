import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLocaleFromPathname,
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
  });

  it("stripLocalePrefix removes locale segment", () => {
    assert.equal(stripLocalePrefix("/de/legal"), "/legal");
    assert.equal(stripLocalePrefix("/de/book"), "/book");
    assert.equal(stripLocalePrefix("/fr"), "/");
    assert.equal(stripLocalePrefix("/book"), "/book");
    assert.equal(stripLocalePrefix("/"), "/");
  });

  it("getLocaleFromPathname detects locale from path", () => {
    assert.equal(getLocaleFromPathname("/de/book"), "de");
    assert.equal(getLocaleFromPathname("/ja"), "ja");
    assert.equal(getLocaleFromPathname("/book"), "en");
    assert.equal(getLocaleFromPathname("/"), "en");
  });
});
