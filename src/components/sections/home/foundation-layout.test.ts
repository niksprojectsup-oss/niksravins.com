import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(join(here, "../../../app/globals.css"), "utf8");
const foundationSection = readFileSync(join(here, "HomeFoundationSection.tsx"), "utf8");
const landscapeImage = readFileSync(
  join(here, "../../../../public/cms-uploads/429d442c-3216-4170-884d-791b72c6601e.png"),
);

function ruleBody(selector: string) {
  const pattern = new RegExp(`${selector.replaceAll(".", "\\.")}\\s*\\{([^}]*)\\}`);
  const match = globalsCss.match(pattern);
  assert.ok(match, `missing ${selector}`);
  return match[1] ?? "";
}

function desktopFoundationGrid() {
  const match = globalsCss.match(
    /@media \(min-width: 800px\) \{\s*\.home-foundation-grid \{([^}]*)\}/,
  );
  assert.ok(match, "missing desktop foundation grid");
  return match[1] ?? "";
}

describe("foundation section layout", () => {
  it("uses the uploaded sunset landscape in the foundation section only", () => {
    assert.equal(landscapeImage.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const width = landscapeImage.readUInt32BE(16);
    const height = landscapeImage.readUInt32BE(20);
    assert.equal(width, 1881);
    assert.equal(height, 836);
    assert.match(foundationSection, /cmsHtmlFields\["foundation\.image"\]/);
    assert.doesNotMatch(foundationSection, /429d442c/);
  });

  it("uses a 25mm desktop gap and gives the remaining width to the image", () => {
    const desktop = desktopFoundationGrid();
    const tokens = readFileSync(join(here, "../../../styles/tokens.css"), "utf8");
    assert.match(tokens, /--home-split-gap:\s*25mm/);
    assert.match(desktop, /column-gap:\s*var\(--home-split-gap\)/);
    assert.match(desktop, /grid-template-columns:\s*minmax\(0,\s*36rem\)\s+minmax\(12rem,\s*1fr\)/);
    assert.match(desktop, /align-items:\s*center/);
    assert.doesNotMatch(desktop, /min\(22rem,\s*32%\)/);
    assert.doesNotMatch(desktop, /justify-self:\s*end/);
  });

  it("frames the foundation photo as a landscape near 2:1", () => {
    const media = ruleBody(".home-foundation-media");
    const image = ruleBody(".home-foundation-media img");
    assert.match(media, /aspect-ratio:\s*2\.25\s*\/\s*1/);
    assert.match(media, /border-radius:\s*32px/);
    assert.match(image, /object-fit:\s*cover/);
    assert.match(image, /object-position:\s*center/);
    assert.doesNotMatch(media, /aspect-ratio:\s*4\s*\/\s*5/);
    assert.match(ruleBody(".home-alignment-media"), /aspect-ratio:\s*4\s*\/\s*5/);
    assert.match(ruleBody(".home-foundation-copy"), /max-width:\s*40rem/);
    assert.match(ruleBody(".home-foundation-intro"), /max-width:\s*36rem/);
  });

  it("stacks without the fixed desktop gap", () => {
    const stacked = ruleBody(".home-foundation-grid");
    assert.match(stacked, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
    assert.doesNotMatch(stacked, /2\.5cm/);
    assert.doesNotMatch(stacked, /25mm/);
    assert.doesNotMatch(stacked, /--home-split-gap/);
    assert.doesNotMatch(stacked, /column-gap/);
  });
});