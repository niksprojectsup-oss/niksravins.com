import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const globalsCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../app/globals.css"),
  "utf8",
);

function ruleBody(selector: string) {
  const pattern = new RegExp(`${selector.replaceAll(".", "\\.")}\\s*\\{([^}]*)\\}`);
  const match = globalsCss.match(pattern);
  assert.ok(match, `missing ${selector}`);
  return match[1] ?? "";
}

describe("alignment text panel", () => {
  it("uses a 92% warm canvas overlay so the photograph stays faintly visible", () => {
    const panel = ruleBody(".home-alignment-panel");
    const match = panel.match(
      /background:\s*color-mix\(in srgb,\s*var\(--nr-canvas\)\s+(\d+)%\s*,\s*transparent\)/,
    );
    assert.ok(match, "panel background must use the shared canvas token");
    assert.equal(Number(match[1]), 92);
    assert.doesNotMatch(panel, /rgba\(\s*255\s*,\s*255\s*,\s*255/);
  });

  it("does not restyle the panel background in other breakpoints", () => {
    const overrides = [...globalsCss.matchAll(/\.home-alignment-panel\s*\{([^}]*)\}/g)].slice(1);
    for (const override of overrides) {
      assert.doesNotMatch(override[1] ?? "", /background/);
    }
  });
});