import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { enPortal } from "@/content/i18n/portal/en";
import {
  ADMIN_PORTAL_PREVIEW_LABEL,
  ADMIN_PORTAL_PREVIEW_PATH,
  ADMIN_PORTAL_PREVIEW_SECTIONS,
  buildAdminPortalPreviewAudit,
  buildAdminPortalPreviewFixture,
  filterPreviewAssessments,
  filterPreviewInsights,
  filterPreviewJournal,
  previewMutationsAllowed,
  previewSectionLabel,
} from "./admin-preview";

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("admin portal preview", () => {
  it("uses sample data and does not identify a client", () => {
    const data = buildAdminPortalPreviewFixture();
    const serialized = JSON.stringify(data);
    assert.equal(data.firstName, "Preview");
    assert.ok(data.sessions.length > 0);
    assert.ok(data.insights.length > 0);
    assert.ok(data.assessments.length > 0);
    assert.equal(serialized.includes("clientId"), false);
    assert.equal(serialized.includes("@"), false);
    assert.equal(serialized.includes("password"), false);
    for (const record of [...data.sessions, ...data.insights, ...data.assessments]) {
      assert.match(record.id, /^sample-/);
    }
  });

  it("navigates sample sections and filters them locally", () => {
    const data = buildAdminPortalPreviewFixture();
    assert.deepEqual(ADMIN_PORTAL_PREVIEW_SECTIONS, [
      "home",
      "journey",
      "sessions",
      "insights",
      "journal",
    ]);
    assert.equal(previewSectionLabel("home", enPortal), "Home");
    assert.equal(previewSectionLabel("journey", enPortal), "My path");
    assert.equal(previewSectionLabel("sessions", enPortal), "Sessions");
    assert.equal(previewSectionLabel("insights", enPortal), "Insights");
    assert.equal(previewSectionLabel("journal", enPortal), "Session journal");

    assert.equal(filterPreviewInsights(data.insights, "pause", "ALL").length, 1);
    assert.equal(filterPreviewInsights(data.insights, "", "TRIGGER").length, 1);
    assert.equal(filterPreviewInsights(data.insights, "missing-sample", "ALL").length, 0);
    assert.equal(filterPreviewAssessments(data.assessments, "3", data.asOf).length, 1);
    assert.equal(filterPreviewAssessments(data.assessments, "6", data.asOf).length, 2);
    assert.equal(filterPreviewAssessments(data.assessments, "all", data.asOf).length, 3);
    assert.equal(filterPreviewJournal(data.sessions, "").length, 2);
    assert.equal(filterPreviewJournal(data.sessions, "pause").length, 1);
    assert.equal(previewMutationsAllowed(), false);
  });

  it("audits a visual preview without a client resource", () => {
    const audit = buildAdminPortalPreviewAudit("admin-1");
    assert.equal(audit.action, "portal.preview");
    assert.equal(audit.resource, "portal");
    assert.equal(audit.resourceId, null);
    assert.equal(audit.actorAdminId, "admin-1");
    assert.equal(audit.actorRole, "ADMIN");
    assert.deepEqual(audit.metadata, { clientSession: false, sampleData: true });
  });

  it("keeps the preview behind admin auth and away from client sessions", () => {
    const page = source("../../app/admin/(preview)/portal-preview/page.tsx");
    const view = source("../../components/admin/portal/AdminPortalPreview.tsx");
    const nav = source("../../content/admin.ts");
    const proxy = source("../../proxy.ts");
    const combined = `${page}\n${view}`;

    assert.match(page, /requireAdmin\(\)/);
    assert.match(page, /ADMIN_PORTAL_PREVIEW_LABEL/);
    assert.match(page, /logAuditEvent\(buildAdminPortalPreviewAudit\(session\.id\)\)/);
    assert.match(view, /buildAdminPortalPreviewFixture\(\)/);
    assert.equal(ADMIN_PORTAL_PREVIEW_LABEL, "Administrator Preview — not a client session");
    assert.equal(ADMIN_PORTAL_PREVIEW_PATH, "/admin/portal-preview");
    assert.match(nav, /href: "\/admin\/portal-preview"/);

    for (const section of ADMIN_PORTAL_PREVIEW_SECTIONS) {
      assert.match(view, new RegExp(`section === "${section}"`));
    }
    assert.match(view, /data-preview-section=\{id\}/);

    for (const forbidden of [
      "getPortalHome",
      "requireClient",
      "setSessionCookie",
      "createClientAuthSession",
      "ensureClientPortalAccount",
      "saveSessionPreparationAction",
      "saveJournalEntryAction",
      "deleteJournalEntryAction",
      "setPortalLocaleAction",
      "prisma",
      "clientId",
    ]) {
      assert.equal(combined.includes(forbidden), false, forbidden);
    }

    assert.doesNotMatch(combined, /href=["']\/client/);
    assert.doesNotMatch(view, /<form|action=/);
    assert.match(view, /disabled=\{writesDisabled\}/);
    assert.match(proxy, /PUBLIC_ADMIN_PATHS = \["\/admin\/login"\]/);
    assert.doesNotMatch(proxy, /portal-preview/);
  });
});
