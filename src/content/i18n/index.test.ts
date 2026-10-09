import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicContent } from "@/content/i18n";

describe("public content navigation", () => {
  it("localizes homepage section links for English", () => {
    const content = getPublicContent("en");

    assert.equal(content.navigation[0]?.href, "/#want-change");
    assert.equal(content.navigation[1]?.href, "/#identity-shifts");
    assert.equal(content.navigation[2]?.href, "/#faq");
    assert.equal(content.navigation[3]?.href, "/#contact");
    assert.equal(content.navigation[0]?.label, "Explore options");
    assert.equal(content.navigation[1]?.label, "Identity Shifts");
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });

  it("localizes homepage section links for non-English locales", () => {
    const content = getPublicContent("de");

    assert.equal(content.navigation[0]?.href, "/de#want-change");
    assert.equal(content.navigation[1]?.href, "/de#identity-shifts");
    assert.equal(content.navigation[2]?.href, "/de#faq");
    assert.equal(content.navigation[3]?.href, "/de#contact");
    assert.equal(content.navigation[0]?.label, "Explore options");
    assert.equal(content.navigation[1]?.label, "Identity Shifts");
    assert.ok(content.navigation.every((item) => !item.href.includes("#about") && !item.href.includes("#aap")));
  });
});
