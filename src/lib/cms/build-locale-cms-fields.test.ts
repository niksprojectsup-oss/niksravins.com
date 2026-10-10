import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lvContent } from "@/content/i18n/lv";
import { getFilePublicContent } from "@/content/i18n";
import {
  buildDesignedLatvianHeroDocument,
  buildLocaleHomeCmsFields,
  buildLocaleLegalBody,
} from "@/lib/cms/build-locale-cms-fields";
import { tiptapJsonToPlainText } from "@/lib/cms/tiptap";

describe("locale CMS field builder", () => {
  it("builds Latvian home fields from Latvian catalog, not English CMS copy", () => {
    const fields = buildLocaleHomeCmsFields(lvContent);
    const english = getFilePublicContent("en");

    assert.ok(fields["hero.primaryCta.label"]);
    assert.ok(fields["faq.items.0.question"]);
    assert.ok(fields["foundation.intro"]);
    assert.ok(fields["journey.change.0"]);
    assert.ok(fields["alignment.0.title"]);
    assert.equal(fields["foundation.image"], undefined);

    assert.match(tiptapJsonToPlainText(fields["hero.primaryCta.label"]!), /Rezervēt sesiju/);
    assert.match(tiptapJsonToPlainText(fields["faq.items.0.question"]!), /identitātes pārrakstīšana/i);
    assert.equal(
      tiptapJsonToPlainText(fields["hero.primaryCta.label"]!),
      "Rezervēt sesiju",
    );
    assert.notEqual(
      tiptapJsonToPlainText(fields["faq.items.0.question"]!),
      english.faq.items[0]?.question,
    );
    assert.doesNotMatch(tiptapJsonToPlainText(fields["hero.headline"]!), /Personal Transformation/);
    assert.doesNotMatch(tiptapJsonToPlainText(fields["hero.headline"]!), /Book a Session/);
  });

  it("uses designed Latvian hero copy without English HTML", () => {
    const text = tiptapJsonToPlainText(buildDesignedLatvianHeroDocument());
    assert.match(text, /Jūs saprotat reakciju/);
    assert.match(text, /Personiskā transformācija/);
    assert.doesNotMatch(text, /You understand/);
  });

  it("builds a Latvian legal body from catalog labels", () => {
    const body = buildLocaleLegalBody(lvContent);
    const text = tiptapJsonToPlainText(body);
    assert.match(text, /Juridiskā informācija/);
    assert.match(text, /Visas tiesības aizsargātas/);
    assert.match(text, /hello@niksravins.com/);
    assert.doesNotMatch(text, /\bLegal\b/);
    assert.doesNotMatch(text, /All rights reserved/);
  });
});
