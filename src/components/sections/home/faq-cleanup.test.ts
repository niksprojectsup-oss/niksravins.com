import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(join(here, "../../../app/globals.css"), "utf8");
const tokensCss = readFileSync(join(here, "../../../styles/tokens.css"), "utf8");

function source(path: string) {
  return readFileSync(join(here, path), "utf8");
}

describe("FAQ section cleanup", () => {
  it("drops the small heading label and keeps the FAQ title", () => {
    const homeFaq = source("HomeFaqSection.tsx");
    const standaloneFaq = source("../FAQ.tsx");

    for (const file of [homeFaq, standaloneFaq]) {
      assert.doesNotMatch(file, /faq\.headingLabel/);
      assert.doesNotMatch(file, /type-label/);
      assert.match(file, /id="faq-heading"/);
      assert.match(file, /faq\.heading/);
    }

    assert.match(homeFaq, /className="type-home-title"/);
    assert.match(homeFaq, /className="home-faq-row"/);
  });

  it("removes only the email beside the FAQ booking button", () => {
    const cta = source("../FinalCTA.tsx");
    const footer = source("../../layout/Footer.tsx");

    assert.match(cta, /href=\{finalCta\.button\.href\}/);
    assert.match(cta, /variant="booking"/);
    assert.doesNotMatch(cta, /mailto:/);
    assert.doesNotMatch(cta, /site\.email/);
    assert.match(footer, /mailto:\$\{content\.site\.email\}/);
  });

  it("lets the desktop FAQ title use the section width and a 25mm gap above it", () => {
    assert.match(globalsCss, /\.type-home-title\s*\{[^}]*max-width:\s*16ch/);
    assert.match(
      globalsCss,
      /@media \(min-width: 1024px\)\s*\{[\s\S]*?\.home-roots\s*\{\s*padding-bottom:\s*0;[\s\S]*?\.home-faq-section\s*\{\s*padding-top:\s*var\(--home-split-gap\);[\s\S]*?\.home-faq-section \.home-section-intro\s*\{\s*max-width:\s*none;[\s\S]*?\.home-faq-section \.type-home-title\s*\{\s*max-width:\s*none;/,
    );
    assert.doesNotMatch(globalsCss, /\.home-faq-section \.type-home-title\s*\{[^}]*white-space:\s*nowrap/);
    assert.match(globalsCss, /\.home-section-intro\s*\{\s*margin-bottom:\s*clamp\(2\.5rem, 5vw, 4\.5rem\)/);
    assert.match(tokensCss, /--home-split-gap:\s*25mm/);
  });
});
