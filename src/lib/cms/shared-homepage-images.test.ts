import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CmsContentItem } from "@prisma/client";
import { CMS_LOCALES, getCmsPageDefinition } from "@/lib/cms/definitions";
import { tiptapImageDocument } from "@/lib/cms/import/tiptap-builders";
import { buildPreviewCmsPageFields } from "@/lib/cms/preview-page-content";
import { buildPublishedCmsPageFields } from "@/lib/cms/published-page-content";
import {
  getCmsImageAltFromDocument,
  homepageImageFieldKeys,
  planSharedHomepageImageDraftWrites,
  planSharedHomepageImageMirrors,
} from "@/lib/cms/shared-homepage-images";
import { createEmptyTiptapDocument, getCmsImageSrcFromDocument } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

const home = getCmsPageDefinition("home");
const legal = getCmsPageDefinition("legal");
if (!home || !legal) {
  throw new Error("Missing CMS page definition");
}

const older = new Date("2026-01-01T00:00:00Z");
const newer = new Date("2026-06-01T00:00:00Z");

function item(
  overrides: Partial<CmsContentItem> & Pick<CmsContentItem, "locale" | "fieldKey">,
): CmsContentItem {
  return {
    id: overrides.id ?? `${overrides.locale}-${overrides.fieldKey}`,
    sectionId: overrides.sectionId ?? "foundation-section",
    locale: overrides.locale,
    fieldKey: overrides.fieldKey,
    draftJson: overrides.draftJson ?? null,
    publishedJson: overrides.publishedJson ?? null,
    plainText: overrides.plainText ?? null,
    createdAt: overrides.createdAt ?? older,
    updatedAt: overrides.updatedAt ?? older,
  };
}

function image(src: string, alt: string): CmsTiptapJson {
  const document = tiptapImageDocument(src, alt);
  const node = document.content?.[0];
  if (node?.attrs) {
    node.attrs.width = 640;
  }
  return document;
}

describe("shared homepage images", () => {
  it("lists only the dedicated homepage image slots", () => {
    const keys = homepageImageFieldKeys(home);
    assert.deepEqual(keys, [
      "foundation.image",
      "alignment.0.image",
      "alignment.1.image",
      "alignment.2.image",
      "alignment.3.image",
      "alignment.4.image",
      "alignment.5.image",
      "underneath.image",
      "roots.image",
    ]);
    assert.equal(homepageImageFieldKeys(legal).length, 0);
  });

  it("shows one published image in every locale and keeps that locale's text and alt", () => {
    const items = [
      item({
        locale: "en",
        fieldKey: "foundation.image",
        publishedJson: image("/cms-uploads/new.png", "English landscape"),
        updatedAt: newer,
      }),
      item({
        locale: "de",
        fieldKey: "foundation.image",
        publishedJson: image("/cms-uploads/old.png", "Deutsche Landschaft"),
        updatedAt: older,
      }),
      item({
        locale: "de",
        sectionId: "hero-section",
        fieldKey: "hero.headline",
        publishedJson: createEmptyTiptapDocument("Deutscher Titel"),
        plainText: "Deutscher Titel",
      }),
      item({
        locale: "en",
        sectionId: "hero-section",
        fieldKey: "hero.headline",
        publishedJson: createEmptyTiptapDocument("English title"),
        plainText: "English title",
        updatedAt: newer,
      }),
    ];

    const german = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      locale: "de",
      fieldKeys: ["foundation.image", "hero.headline"],
      items,
    });
    const french = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      locale: "fr",
      fieldKeys: ["foundation.image", "hero.headline"],
      items,
    });

    assert.equal(getCmsImageSrcFromDocument(german["foundation.image"]), "/cms-uploads/new.png");
    assert.equal(getCmsImageAltFromDocument(german["foundation.image"]), "Deutsche Landschaft");
    assert.equal(german["foundation.image"]?.content?.[0]?.attrs?.width, 640);
    assert.equal(german["hero.headline"]?.content?.[0]?.content?.[0]?.text, "Deutscher Titel");
    assert.equal(french["hero.headline"], undefined);
    assert.equal(getCmsImageSrcFromDocument(french["foundation.image"]), "/cms-uploads/new.png");
    assert.equal(getCmsImageAltFromDocument(french["foundation.image"]), "");
  });

  it("keeps an unpublished image replacement off the public page until that locale is published", () => {
    const items = [
      item({
        locale: "lv",
        fieldKey: "roots.image",
        draftJson: image("/cms-uploads/draft.png", "Melnraksts"),
        publishedJson: image("/cms-uploads/live.png", "Publicēts"),
        updatedAt: newer,
      }),
      item({
        locale: "en",
        fieldKey: "roots.image",
        publishedJson: image("/cms-uploads/live.png", "Published"),
        updatedAt: older,
      }),
    ];

    const published = buildPublishedCmsPageFields({
      page: { status: "PUBLISHED" },
      locale: "en",
      fieldKeys: ["roots.image"],
      items,
    });
    const preview = buildPreviewCmsPageFields({
      locale: "en",
      fieldKeys: ["roots.image"],
      items,
    });

    assert.equal(getCmsImageSrcFromDocument(published["roots.image"]), "/cms-uploads/live.png");
    assert.equal(getCmsImageAltFromDocument(published["roots.image"]), "Published");
    assert.equal(getCmsImageSrcFromDocument(preview["roots.image"]), "/cms-uploads/draft.png");
    assert.equal(getCmsImageAltFromDocument(preview["roots.image"]), "Published");
  });

  it("copies a replaced image into the other locales' drafts without copying text", () => {
    const writes = planSharedHomepageImageDraftWrites({
      definition: home,
      sections: [
        { id: "foundation-section", key: "foundation" },
        { id: "hero-section", key: "hero" },
      ],
      sourceLocale: "lv",
      fields: {
        "foundation.image": image("/cms-uploads/replaced.png", "Latviešu"),
        "foundation.intro": createEmptyTiptapDocument("Latviešu ievads"),
        "hero.headline": createEmptyTiptapDocument("Latviešu virsraksts"),
      },
      existingItems: [
        {
          sectionId: "foundation-section",
          locale: "de",
          fieldKey: "foundation.image",
          draftJson: image("/cms-uploads/old.png", "Deutsche Landschaft"),
          publishedJson: image("/cms-uploads/old.png", "Deutsche Landschaft"),
          updatedAt: older,
        },
        {
          sectionId: "foundation-section",
          locale: "en",
          fieldKey: "foundation.image",
          draftJson: image("/cms-uploads/replaced.png", "English landscape"),
          publishedJson: image("/cms-uploads/replaced.png", "English landscape"),
          updatedAt: older,
        },
      ],
      createId: () => "shared-id",
    });

    assert.equal(writes.length, CMS_LOCALES.length - 2);
    assert.equal(writes.some((write) => write.locale === "lv" || write.locale === "en"), false);
    assert.equal(writes.some((write) => write.fieldKey !== "foundation.image"), false);

    const german = writes.find((write) => write.locale === "de");
    assert.equal(german?.sectionId, "foundation-section");
    assert.equal(getCmsImageSrcFromDocument(german?.draftJson as CmsTiptapJson), "/cms-uploads/replaced.png");
    assert.equal(getCmsImageAltFromDocument(german?.draftJson as CmsTiptapJson), "Deutsche Landschaft");
  });

  it("publishes the shared image into other locales and leaves their alt text in place", () => {
    const mirrors = planSharedHomepageImageMirrors({
      definition: home,
      sourceLocale: "lv",
      items: [
        {
          sectionId: "alignment-section",
          locale: "lv",
          fieldKey: "alignment.0.image",
          draftJson: image("/cms-uploads/card.png", "Latviešu karte"),
          publishedJson: image("/cms-uploads/previous.png", "Vecā karte"),
          updatedAt: newer,
        },
        {
          sectionId: "alignment-section",
          locale: "de",
          fieldKey: "alignment.0.image",
          draftJson: image("/cms-uploads/previous.png", "Entwurf"),
          publishedJson: image("/cms-uploads/previous.png", "Deutsche Karte"),
          updatedAt: older,
        },
        {
          sectionId: "hero-section",
          locale: "lv",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Latviešu virsraksts"),
          publishedJson: createEmptyTiptapDocument("Vecais virsraksts"),
          updatedAt: newer,
        },
        {
          sectionId: "hero-section",
          locale: "de",
          fieldKey: "hero.headline",
          draftJson: createEmptyTiptapDocument("Deutscher Entwurf"),
          publishedJson: createEmptyTiptapDocument("Deutscher Titel"),
          updatedAt: older,
        },
      ],
    });

    assert.equal(mirrors.length, CMS_LOCALES.length - 1);
    assert.equal(mirrors.some((mirror) => mirror.fieldKey !== "alignment.0.image"), false);

    const german = mirrors.find((mirror) => mirror.locale === "de");
    assert.equal(getCmsImageSrcFromDocument(german?.publishedJson), "/cms-uploads/card.png");
    assert.equal(getCmsImageAltFromDocument(german?.publishedJson), "Deutsche Karte");
    assert.equal(getCmsImageAltFromDocument(german?.draftJson), "Entwurf");

    const alreadyShared = planSharedHomepageImageMirrors({
      definition: home,
      sourceLocale: "lv",
      items: [
        {
          sectionId: "alignment-section",
          locale: "lv",
          fieldKey: "alignment.0.image",
          draftJson: image("/cms-uploads/card.png", "Latviešu karte"),
          publishedJson: null,
          updatedAt: newer,
        },
        {
          sectionId: "alignment-section",
          locale: "de",
          fieldKey: "alignment.0.image",
          draftJson: image("/cms-uploads/card.png", "Entwurf"),
          publishedJson: image("/cms-uploads/card.png", "Deutsche Karte"),
          updatedAt: older,
        },
      ],
    });
    assert.equal(alreadyShared.some((mirror) => mirror.locale === "de"), false);
    assert.equal(planSharedHomepageImageMirrors({
      definition: legal,
      sourceLocale: "lv",
      items: [],
    }).length, 0);
  });
});
