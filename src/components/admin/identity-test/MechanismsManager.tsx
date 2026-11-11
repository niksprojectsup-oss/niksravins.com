"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TranslationField } from "./TranslationField";
import { StatusControl } from "./StatusControl";
import { upsertMechanismTagAction, upsertConnectorAction } from "@/lib/admin/actions/identity-test";
import type { IdentityContentStatus, IdentityConnectorKind } from "@prisma/client";

type TRow = {
  id?: string;
  entityId: string;
  field: string;
  locale: string;
  draftValue: string;
  publishedValue: string | null;
  translationStatus: string;
};

const KINDS: IdentityConnectorKind[] = ["OPENING", "JOIN_SIMILAR", "JOIN_CONTRAST", "TRANSITION", "CLOSING"];
const LOCALES = ["lv", "en"] as const;

export function MechanismsManager({
  tags,
  connectors,
  translations,
}: {
  tags: { id: string; key: string; sortOrder: number; status: string; usage: number }[];
  connectors: { id: string; key: string; kind: IdentityConnectorKind; status: string }[];
  translations: TRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newTag, setNewTag] = useState("");
  const [newConn, setNewConn] = useState({ key: "", kind: "OPENING" as IdentityConnectorKind });

  const t = (entityId: string, locale: string): TRow =>
    translations.find((r) => r.entityId === entityId && r.field === "text" && r.locale === locale) ?? {
      entityId, field: "text", locale, draftValue: "", publishedValue: null, translationStatus: "NOT_TRANSLATED",
    };

  return (
    <div className="layout-stack-lg">
      <section className="observed-card space-y-4 p-6">
        <h2 className="type-heading-sm">Mehānismu tagi</h2>
        <form className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTag.trim()) return;
            start(async () => { await upsertMechanismTagAction({ key: newTag.trim() }); setNewTag(""); router.refresh(); });
          }}>
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="jauns-taģa-atslēga"
            className="min-h-10 w-64 rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          <button type="submit" disabled={pending} className="type-caption rounded-full bg-accent px-4 py-2 text-surface">Pievienot</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr>{["Atslēga", "Lietojumi", "Statuss"].map((h) => <th key={h} className="type-caption px-2 py-1 text-ink-subtle">{h}</th>)}</tr></thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-t border-border-subtle">
                  <td className="px-2 py-1.5 font-mono text-xs">{tag.key}</td>
                  <td className="px-2 py-1.5">{tag.usage}</td>
                  <td className="px-2 py-1.5">
                    <StatusControl value={tag.status}
                      onSave={(s: IdentityContentStatus) => upsertMechanismTagAction({ id: tag.id, key: tag.key, status: s })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="observed-card space-y-4 p-6">
        <h2 className="type-heading-sm">Savienotājfrāzes</h2>
        <form className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newConn.key.trim()) return;
            start(async () => { await upsertConnectorAction({ key: newConn.key.trim(), kind: newConn.kind }); setNewConn({ key: "", kind: "OPENING" }); router.refresh(); });
          }}>
          <input value={newConn.key} onChange={(e) => setNewConn((p) => ({ ...p, key: e.target.value }))} placeholder="atslēga"
            className="min-h-10 w-56 rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          <select value={newConn.kind} onChange={(e) => setNewConn((p) => ({ ...p, kind: e.target.value as IdentityConnectorKind }))}
            className="min-h-10 rounded-md border border-border bg-surface px-2 text-sm text-ink">
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <button type="submit" disabled={pending} className="type-caption rounded-full bg-accent px-4 py-2 text-surface">Pievienot</button>
        </form>
        {connectors.map((c) => (
          <details key={c.id} className="rounded-md border border-border-subtle p-3">
            <summary className="flex cursor-pointer items-center gap-3">
              <span className="font-mono text-xs">{c.key}</span>
              <span className="type-caption text-ink-faint">{c.kind}</span>
            </summary>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <StatusControl value={c.status}
                  onSave={(s: IdentityContentStatus) => upsertConnectorAction({ id: c.id, key: c.key, kind: c.kind, status: s })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {LOCALES.map((l) => {
                  const row = t(c.id, l);
                  return (
                    <TranslationField key={l} entityType="CONNECTOR" entityId={c.id} field="text" locale={l}
                      label="Teksts" draftValue={row.draftValue} publishedValue={row.publishedValue}
                      translationStatus={row.translationStatus} translationId={row.id} />
                  );
                })}
              </div>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
