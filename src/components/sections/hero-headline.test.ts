import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  HOME_HERO_HEADLINE_CLASS,
  cmsHeroHtmlHasMediumKicker,
} from "@/components/sections/hero-headline";

const globalsCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../app/globals.css"),
  "utf8",
);
const heroSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Hero.tsx"), "utf8");
import { getPublishedCmsFieldHtml } from "@/lib/cms/published-field-html";
import type { CmsTiptapJson } from "@/lib/cms/types";

const latvianComposedHeadline: CmsTiptapJson = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Tu saproti, kas ar tevi notiek, bet tik un tā reaģē tāpat.",
          marks: [{ type: "textStyle", attrs: { fontSize: "medium", color: "#000000" } }],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Personīgā transformācija" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Darbs ar dziļākajām identitātes pārliecībām un emocionālajiem modeļiem.",
        },
      ],
    },
  ],
};

describe("homepage hero headline kicker", () => {
  it("keeps the composed Latvian hero as separate blocks, including the medium kicker", () => {
    const html = getPublishedCmsFieldHtml(
      { "hero.headline": latvianComposedHeadline },
      "hero.headline",
      "inline",
    );

    assert.match(html ?? "", /<p>/);
    assert.match(html ?? "", /<h3>/);
    assert.match(html ?? "", /font-size:\s*medium/);
    assert.match(html ?? "", /Personīgā transformācija/);
    assert.equal(cmsHeroHtmlHasMediumKicker(html), true);
  });

  it("does not treat the English display headline or a 22px span as the overlapping kicker", () => {
    assert.equal(
      cmsHeroHtmlHasMediumKicker("<p>You understand the reaction but it still happens</p>"),
      false,
    );
    assert.equal(
      cmsHeroHtmlHasMediumKicker(
        '<h3><span style="font-size: 22px; line-height: 1;">Personal Transformation</span></h3>',
      ),
      false,
    );
  });

  it("scopes the tracking reset to the shared hero headline class", () => {
    assert.match(HOME_HERO_HEADLINE_CLASS, /home-hero-headline/);
    assert.match(HOME_HERO_HEADLINE_CLASS, /type-display/);
  });

  it("re-resolves hero tracking for explicit px sizes, not only the medium kicker", () => {
    assert.match(globalsCss, /\.home-hero-headline\s*\{\s*--cms-tracking:\s*var\(--nr-tracking-tight\);/);
    assert.match(
      globalsCss,
      /\.cms-published-text \[style\*="font-size"\]:not\(\[style\*="letter-spacing"\]\):not\(\[style\*="font-size: medium"\]\):not\(\[style\*="font-size:medium"\]\)\s*\{\s*letter-spacing:\s*var\(--cms-tracking, normal\);/,
    );
    assert.match(globalsCss, /\.home-hero-headline \[style\*="font-size: medium"\]/);
    assert.doesNotMatch(globalsCss, /letter-spacing:\s*[^;]*!important/);
  });

  it("keeps a small gap under the hero subtitle and pulls the booking button closer", () => {
    assert.match(heroSource, /home-hero-copy layout-stack-lg/);
    assert.match(heroSource, /home-hero-actions/);
    assert.match(
      globalsCss,
      /\.home-hero-headline h3:has\(\+ p:not\(:empty\)\)\s*\{\s*margin-bottom:\s*0\.625rem;/,
    );
    assert.match(
      globalsCss,
      /@media \(min-width: 768px\)\s*\{\s*\.home-hero-copy\.layout-stack-lg > \.home-hero-actions\s*\{\s*margin-top:\s*2\.25rem;/,
    );
  });
});
