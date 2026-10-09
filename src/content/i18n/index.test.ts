import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicContent } from "@/content/i18n";

describe("public content navigation", () => {
  it("localizes homepage section links for English", () => {
    const content = getPublicContent("en");

    assert.equal(content.navigation[0]?.href, "/#faq");
    assert.equal(content.navigation[1]?.href, "/#contact");
    assert.equal(content.hero.secondaryCta.href, "/#want-change");
    assert.equal(content.hero.tertiaryCta.href, "/#identity-shifts");
    assert.equal(content.hero.secondaryCta.label, "Explore options");
    assert.equal(content.hero.tertiaryCta.label, "Identity Shifts");
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });

  it("localizes homepage section links for non-English locales", () => {
    const content = getPublicContent("de");

    assert.equal(content.navigation[0]?.href, "/de#faq");
    assert.equal(content.navigation[1]?.href, "/de#contact");
    assert.equal(content.hero.secondaryCta.href, "/de#want-change");
    assert.equal(content.hero.tertiaryCta.href, "/de#identity-shifts");
    assert.equal(content.hero.tertiaryCta.label, "Identity Shifts");
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });
});
