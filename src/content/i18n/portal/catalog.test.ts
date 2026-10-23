import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOCALES } from "@/lib/i18n/config";
import { parsePortalLocale } from "@/lib/i18n/portal-locale-parse";
import { PORTAL_BY_LOCALE, getPortalContent } from "./index";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("portal translations", () => {
  it("covers every public locale with the same non-empty keys", () => {
    const englishKeys = leafKeys(PORTAL_BY_LOCALE.en).sort();
    assert.ok(englishKeys.length > 40);

    for (const locale of LOCALES) {
      const content = getPortalContent(locale);
      const keys = leafKeys(content).sort();
      assert.deepEqual(keys, englishKeys, `${locale} portal keys differ`);
      for (const key of keys) {
        const value = key.split(".").reduce<unknown>((current, part) => {
          if (!current || typeof current !== "object") return undefined;
          return (current as Record<string, unknown>)[part];
        }, content);
        assert.equal(typeof value, "string");
        assert.ok(String(value).trim().length > 0, `${locale} ${key} is empty`);
      }
    }
  });

  it("keeps an unknown portal locale on English", () => {
    assert.equal(parsePortalLocale("xx"), "en");
    assert.equal(parsePortalLocale(undefined), "en");
    assert.equal(parsePortalLocale("lv"), "lv");
    assert.equal(getPortalContent("lv").hero.greeting.includes("{name}"), true);
  });
});
