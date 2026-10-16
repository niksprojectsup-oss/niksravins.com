import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CmsContentItem } from "@prisma/client";
import { CMS_LOCALES } from "@/lib/cms/definitions";
import { cmsHtmlFieldsForRequestedLocale } from "@/lib/cms/locale-render";
import {
  assertCanPreviewCmsContent,
  buildPreviewCmsPageFields,
  cmsPreviewPath,
  parseCmsPreviewRequest,
  previewFieldsToPlainTextMap,
} from "@/lib/cms/preview-page-content";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import { createEmptyTiptapDocument, tiptapJsonToPlainText } from "@/lib/cms/tiptap";

function item(overrides: Partial<CmsContentItem> & Pick<CmsContentItem, "locale" | "fieldKey">): CmsContentItem {
  return {
    id: overrides.id ?? `${overrides.locale}-${overrides.fieldKey}`,
    sectionId: overrides.sectionId ?? "s1",
    locale: overrides.locale,
    fieldKey: overrides.fieldKey,
    draftJson: overrides.draftJson ?? null,
    publishedJson: overrides.publishedJson ?? null,
    plainText: overrides.plainText ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  };
}

describe("cms preview authorization", () => {
  it("allows only admin roles to open draft previews", () => {
    assert.doesNotThrow(() => assertCanPreviewCmsContent("ADMIN"));
    assert.throws(() => assertCanPreviewCmsContent("CLIENT"), /Unauthorized/);
    assert.throws(() => assertCanPreviewCmsContent(undefined), /Unauthorized/);
  });

  it("accepts home and legal for every CMS locale including Latvian", () => {
    for (const locale of CMS_LOCALES) {
      assert.deepEqual(parseCmsPreviewRequest({ slug: "home", locale }), {
        ok: true,
        slug: "home",
        locale,
      });
      assert.deepEqual(parseCmsPreviewRequest({ slug: "legal", locale }), {
        ok: true,
        slug: "legal",
        locale,
      });
    }

    assert.equal(cmsPreviewPath("home", "lv"), "/admin/content/home/preview?locale=lv");
  });

  it("rejects public-only or deprecated slugs and unknown locales", () => {
    assert.deepEqual(parseCmsPreviewRequest({ slug: "about", locale: "lv" }), {
      ok: false,
      reason: "not_found",
    });
    assert.deepEqual(parseCmsPreviewRequest({ slug: "aap", locale: "en" }), {
      ok: false,
      reason: "not_found",
    });
    assert.deepEqual(parseCmsPreviewRequest({ slug: "home", locale: "xx" }), {
      ok: false,
      reason: "unsupported_locale",
    });
  });
});

describe("cms preview draft and published fallback", () => {
  it("prefers the requested locale draft over its published JSON", () => {
    const fields = buildPreviewCmsPageFields({
      locale: "lv",
      fieldKeys: ["hero.headline", "body"],
      items: [
        item({
          locale: "lv",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Latviešu melnraksts"),
          publishedJson: createEmptyTiptapDocument("Publicēts LV"),
        }),
        item({
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("English draft"),
          publishedJson: createEmptyTiptapDocument("English published"),
        }),
      ],
    });

    assert.match(tiptapJsonToPlainText(fields["hero.headline"]!), /Latviešu melnraksts/);
    assert.doesNotMatch(tiptapJsonToPlainText(fields["hero.headline"]!), /English/);
    assert.equal(fields.body, undefined);
  });

  it("falls back to the same locale published JSON when draft is empty", () => {
    const fields = buildPreviewCmsPageFields({
      locale: "lv",
      fieldKeys: ["body"],
      items: [
        item({
          locale: "lv",
          fieldKey: "body",
          draftJson: createEmptyTiptapDocument(),
          publishedJson: createEmptyTiptapDocument("Juridiskā informācija"),
        }),
        item({
          locale: "en",
          fieldKey: "body",
          publishedJson: createEmptyTiptapDocument("Legal English"),
        }),
      ],
    });

    assert.match(tiptapJsonToPlainText(fields.body!), /Juridiskā informācija/);
    assert.doesNotMatch(tiptapJsonToPlainText(fields.body!), /Legal English/);
  });

  it("still previews drafts when the page status is DRAFT", () => {
    const preview = buildPreviewCmsPageFields({
      locale: "de",
      fieldKeys: ["hero.headline"],
      items: [
        item({
          locale: "de",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Deutscher Entwurf"),
        }),
      ],
    });
    const published = buildPublishedCmsPageFields({
      page: { status: "DRAFT" },
      locale: "de",
      fieldKeys: ["hero.headline"],
      items: [
        item({
          locale: "de",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Deutscher Entwurf"),
        }),
      ],
    });

    assert.match(tiptapJsonToPlainText(preview["hero.headline"]!), /Deutscher Entwurf/);
    assert.deepEqual(published, {});
  });
});

describe("cms preview locale isolation", () => {
  it("never uses English CMS HTML for a Latvian preview", () => {
    const fields = buildPreviewCmsPageFields({
      locale: "lv",
      fieldKeys: ["hero.headline"],
      items: [
        item({
          locale: "en",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("English CMS headline"),
          publishedJson: createEmptyTiptapDocument("English CMS headline"),
        }),
      ],
    });

    const html = cmsHtmlFieldsForRequestedLocale("lv", { locale: "lv", fields });
    assert.deepEqual(fields, {});
    assert.deepEqual(html, {});
  });

  it("does not expose preview drafts through the public published builder", () => {
    const items = [
      item({
        locale: "lv",
        fieldKey: "hero.headline",
        draftJson: createEmptyTiptapDocument("Nepublicēts LV"),
        publishedJson: createEmptyTiptapDocument("Publicēts LV"),
      }),
    ];

    const preview = previewFieldsToPlainTextMap(
      buildPreviewCmsPageFields({ locale: "lv", fieldKeys: ["hero.headline"], items }),
    );
    const published = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      locale: "lv",
      fieldKeys: ["hero.headline"],
      items,
    });

    assert.equal(preview["hero.headline"], "Nepublicēts LV");
    assert.match(tiptapJsonToPlainText(published["hero.headline"]!), /Publicēts LV/);
    assert.doesNotMatch(tiptapJsonToPlainText(published["hero.headline"]!), /Nepublicēts LV/);
  });
});
