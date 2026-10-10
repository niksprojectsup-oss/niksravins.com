import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCmsPageDefinition } from "@/lib/cms/definitions";
import {
  buildCmsDraftSaveQuery,
  buildCmsPublishQuery,
  cmsSqlText,
  cmsSqlValues,
  missingCmsSectionKeys,
  planCmsDraftItemWrites,
  planCmsPublishItemIds,
} from "@/lib/cms/draft-persistence";
import { createEmptyTiptapDocument } from "@/lib/cms/tiptap";

const home = getCmsPageDefinition("home");
if (!home) {
  throw new Error("Missing home CMS definition");
}

function draftWrite(overrides?: Partial<ReturnType<typeof planCmsDraftItemWrites>[number]>) {
  const [write] = planCmsDraftItemWrites({
    definition: home,
    locale: "lv",
    createId: () => "generated-id",
    sections: [{ id: "hero-section", key: "hero" }],
    fields: {
      "hero.headline": createEmptyTiptapDocument("Melnraksts"),
    },
  });
  return { ...write, ...overrides };
}

describe("cms draft persistence planning", () => {
  it("writes one draft row per submitted field in the matching section and locale", () => {
    const writes = planCmsDraftItemWrites({
      definition: home,
      locale: "lv",
      createId: () => "id-1",
      sections: [
        { id: "hero-section", key: "hero" },
        { id: "faq-section", key: "faq" },
      ],
      fields: {
        "hero.headline": createEmptyTiptapDocument("Latviešu virsraksts"),
        "faq.heading": createEmptyTiptapDocument("BUJ"),
        "unknown.field": createEmptyTiptapDocument("skip"),
      },
    });

    assert.equal(writes.length, 2);
    assert.deepEqual(
      writes.map((write) => write.fieldKey).sort(),
      ["faq.heading", "hero.headline"],
    );
    assert.ok(writes.every((write) => write.locale === "lv"));
    assert.equal(writes.find((write) => write.fieldKey === "hero.headline")?.sectionId, "hero-section");
  });

  it("plans the same field set for Latvian and English — the failure is not locale-specific", () => {
    const fields = Object.fromEntries(
      home.sections.flatMap((section) =>
        section.fields.map((field) => [field.key, createEmptyTiptapDocument(field.key)]),
      ),
    );
    const sections = home.sections.map((section, index) => ({
      id: `section-${index}`,
      key: section.key,
    }));

    const lv = planCmsDraftItemWrites({ definition: home, locale: "lv", sections, fields });
    const en = planCmsDraftItemWrites({ definition: home, locale: "en", sections, fields });

    assert.equal(lv.length, home.sections.reduce((sum, section) => sum + section.fields.length, 0));
    assert.ok(lv.length > 50);
    assert.deepEqual(
      lv.map((write) => write.fieldKey),
      en.map((write) => write.fieldKey),
    );
  });

  it("lists missing section keys without creating them", () => {
    assert.deepEqual(missingCmsSectionKeys(home, [{ id: "hero", key: "hero" }]).includes("faq"), true);
    assert.deepEqual(missingCmsSectionKeys(home, home.sections.map((section, index) => ({
      id: String(index),
      key: section.key,
    }))), []);
  });

  it("skips fields whose section is still missing so the later upsert cannot use a guessed id", () => {
    const writes = planCmsDraftItemWrites({
      definition: home,
      locale: "lv",
      sections: [{ id: "hero-section", key: "hero" }],
      fields: {
        "hero.headline": createEmptyTiptapDocument("Hero"),
        "faq.heading": createEmptyTiptapDocument("BUJ"),
      },
    });

    assert.deepEqual(
      writes.map((write) => write.fieldKey),
      ["hero.headline"],
    );
  });
});

describe("cms draft persistence SQL", () => {
  it("saves drafts in one statement and never writes publishedJson", () => {
    const query = buildCmsDraftSaveQuery("page-1", [draftWrite()]);
    const sql = cmsSqlText(query);

    assert.match(sql, /INSERT INTO "CmsContentItem"/);
    assert.match(sql, /ON CONFLICT \("sectionId", "locale", "fieldKey"\)/);
    assert.match(sql, /UPDATE "CmsPage"/);
    assert.match(sql, /"updatedAt" = CURRENT_TIMESTAMP/);
    assert.doesNotMatch(sql, /"publishedJson"/);
    assert.doesNotMatch(sql, /\$transaction/);
    assert.doesNotMatch(sql, /INSERT INTO "CmsSection"/);
  });

  it("parameterizes identifiers, locale, copy, and page id — user text never enters the SQL strings", () => {
    const write = draftWrite();
    const query = buildCmsDraftSaveQuery("page-1", [write]);
    const sql = cmsSqlText(query);
    const values = cmsSqlValues(query);

    assert.equal(sql.includes("Melnraksts"), false);
    assert.equal(sql.includes("generated-id"), false);
    assert.equal(sql.includes("hero-section"), false);
    assert.equal(sql.includes("page-1"), false);
    assert.ok(values.includes("generated-id"));
    assert.ok(values.includes("hero-section"));
    assert.ok(values.includes("lv"));
    assert.ok(values.includes("hero.headline"));
    assert.ok(values.includes("page-1"));
    assert.ok(values.some((value) => typeof value === "string" && value.includes("Melnraksts")));
    assert.ok(values.some((value) => typeof value === "string" && value.includes("Melnraksts") && value.startsWith("{")));
  });

  it("binds JSON documents as parameterized text and emits SQL NULL for cleared drafts", () => {
    const query = buildCmsDraftSaveQuery("page-1", [
      draftWrite({
        id: "null-id",
        fieldKey: "hero.primaryCta.label",
        draftJson: null,
        plainText: null,
      }),
    ]);
    const sql = cmsSqlText(query);
    const values = cmsSqlValues(query);

    assert.match(sql, /NULL::jsonb/);
    assert.equal(values.includes("null"), false);
    assert.equal(values.includes(null), true);
    assert.ok(values.includes("null-id"));
    assert.doesNotMatch(sql, /"publishedJson"/);
  });

  it("updates only draft columns on unique conflict and leaves createdAt alone", () => {
    const sql = cmsSqlText(buildCmsDraftSaveQuery("page-1", [draftWrite()]));
    const conflict = sql.slice(sql.indexOf("DO UPDATE SET"), sql.indexOf("RETURNING"));

    assert.match(sql, /ON CONFLICT \("sectionId", "locale", "fieldKey"\)/);
    assert.match(conflict, /"draftJson" = EXCLUDED\."draftJson"/);
    assert.match(conflict, /"plainText" = EXCLUDED\."plainText"/);
    assert.match(conflict, /"updatedAt" = CURRENT_TIMESTAMP/);
    assert.doesNotMatch(conflict, /"publishedJson"/);
    assert.doesNotMatch(conflict, /"createdAt"/);
    assert.doesNotMatch(conflict, /"id"/);
    assert.doesNotMatch(conflict, /"locale"/);
    assert.doesNotMatch(conflict, /"fieldKey"/);
  });

  it("rejects an empty write set instead of emitting invalid VALUES SQL", () => {
    assert.throws(
      () => buildCmsDraftSaveQuery("page-1", []),
      /at least one field write/,
    );
  });
});

describe("cms publish persistence SQL", () => {
  it("publishes existing drafts in one statement without sequential updates", () => {
    const sql = cmsSqlText(buildCmsPublishQuery("page-1", ["item-a", "item-b"]));

    assert.match(sql, /"publishedJson" = "draftJson"/);
    assert.match(sql, /'PUBLISHED'/);
    assert.match(sql, /UPDATE "CmsPage"/);
    assert.match(sql, /AND "draftJson" IS NOT NULL/);
    assert.doesNotMatch(sql, /FOR .* OF/);
    assert.doesNotMatch(sql, /"draftJson" =/);
    assert.doesNotMatch(sql, /"plainText"/);
  });

  it("still marks the page published when the locale has no draft rows", () => {
    const query = buildCmsPublishQuery("page-1", []);
    const sql = cmsSqlText(query);

    assert.match(sql, /UPDATE "CmsPage"/);
    assert.match(sql, /'PUBLISHED'::"CmsPageStatus"/);
    assert.doesNotMatch(sql, /UPDATE "CmsContentItem"/);
    assert.doesNotMatch(sql, /"publishedJson"/);
    assert.deepEqual(cmsSqlValues(query), ["page-1"]);
  });

  it("parameterizes publish item ids and page id", () => {
    const query = buildCmsPublishQuery("page-1", ["item-a", "item-b"]);
    const sql = cmsSqlText(query);
    const values = cmsSqlValues(query);

    assert.equal(sql.includes("item-a"), false);
    assert.equal(sql.includes("page-1"), false);
    assert.ok(values.includes("item-a"));
    assert.ok(values.includes("item-b"));
    assert.ok(values.includes("page-1"));
  });

  it("publishes only the requested locale's non-empty drafts", () => {
    const ids = planCmsPublishItemIds(
      [
        { id: "lv-draft", locale: "lv", draftJson: { type: "doc" } },
        { id: "lv-empty", locale: "lv", draftJson: null },
        { id: "en-draft", locale: "en", draftJson: { type: "doc" } },
        { id: "de-draft", locale: "de", draftJson: { type: "doc" } },
      ],
      "lv",
    );

    assert.deepEqual(ids, ["lv-draft"]);
    assert.match(cmsSqlText(buildCmsPublishQuery("page-1", ids)), /"publishedJson" = "draftJson"/);
    assert.deepEqual(planCmsPublishItemIds([{ id: "none", locale: "ja", draftJson: null }], "ja"), []);
  });
});
