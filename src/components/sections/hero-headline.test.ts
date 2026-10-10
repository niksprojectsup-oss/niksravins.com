import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HOME_HERO_HEADLINE_CLASS,
  cmsHeroHtmlHasMediumKicker,
} from "@/components/sections/hero-headline";
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
});
