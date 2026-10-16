import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(join(here, "../../../app/globals.css"), "utf8");
const tokens = readFileSync(join(here, "../../../styles/tokens.css"), "utf8");
const underneathSection = readFileSync(join(here, "HomeUnderneathSection.tsx"), "utf8");

function ruleBody(selector: string) {
  const pattern = new RegExp(`${selector.replaceAll(".", "\\.")}\\s*\\{([^}]*)\\}`);
  const match = globalsCss.match(pattern);
  assert.ok(match, `missing ${selector}`);
  return match[1] ?? "";
}

describe("underneath section layout", () => {
  it("keeps the portrait on the left and centers the text against it", () => {
    const mediaAt = underneathSection.indexOf("home-underneath-media");
    const copyAt = underneathSection.indexOf("home-underneath-copy");
    assert.equal(mediaAt > -1 && copyAt > mediaAt, true);

    const desktop = globalsCss.match(
      /@media \(min-width: 800px\) \{\s*\.home-underneath-grid \{([^}]*)\}/,
    );
    assert.ok(desktop, "missing desktop underneath grid");
    const body = desktop[1] ?? "";
    assert.match(tokens, /--home-split-gap:\s*25mm/);
    assert.match(body, /column-gap:\s*var\(--home-split-gap\)/);
    assert.match(body, /align-items:\s*center/);
    assert.match(body, /grid-template-columns:\s*minmax\(12rem,\s*min\(22rem,\s*34%\)\)\s+minmax\(0,\s*1fr\)/);
    assert.doesNotMatch(body, /clamp\(2\.75rem,\s*4\.5vw,\s*5\.5rem\)/);
  });

  it("preserves the portrait frame, radius, and crop", () => {
    const media = ruleBody(".home-underneath-media");
    const image = ruleBody(".home-underneath-media img");
    assert.match(media, /aspect-ratio:\s*4\s*\/\s*5/);
    assert.match(media, /border-radius:\s*32px/);
    assert.match(image, /object-fit:\s*cover/);
    assert.doesNotMatch(media, /aspect-ratio:\s*2\.25/);
  });

  it("stacks without the fixed desktop gap", () => {
    const stacked = ruleBody(".home-underneath-grid");
    assert.match(stacked, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    assert.match(stacked, /gap:\s*clamp\(2\.25rem,\s*4vw,\s*3\.25rem\)/);
    assert.doesNotMatch(stacked, /25mm/);
    assert.doesNotMatch(stacked, /--home-split-gap/);
    assert.doesNotMatch(stacked, /column-gap/);
  });
});
