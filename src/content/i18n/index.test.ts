import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicContent } from "@/content/i18n";

describe("public content navigation", () => {
  it("localizes homepage section links for English", () => {
    const content = getPublicContent("en");

    assert.equal(content.navigation[0]?.href, "/#about");
    assert.equal(content.navigation[1]?.href, "/#aap");
    assert.equal(content.navigation[2]?.href, "/#faq");
    assert.equal(content.navigation[3]?.href, "/#contact");
    assert.equal(content.hero.secondaryCta.href, "/#aap");
  });

  it("localizes homepage section links for non-English locales", () => {
    const content = getPublicContent("de");

    assert.equal(content.navigation[0]?.href, "/de#about");
    assert.equal(content.navigation[1]?.href, "/de#aap");
    assert.equal(content.navigation[2]?.href, "/de#faq");
    assert.equal(content.navigation[3]?.href, "/de#contact");
    assert.equal(content.hero.secondaryCta.href, "/de#aap");
  });
});
