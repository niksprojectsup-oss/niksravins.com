"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TranslationField } from "./TranslationField";
import { StatusControl } from "./StatusControl";
import {
  updateBeliefAction,
  setBeliefMechanismsAction,
  upsertTrunkAction,
  upsertBranchAction,
  deleteBranchAction,
} from "@/lib/admin/actions/identity-test";
import type { IdentityContentStatus, IdentitySafetyFlag } from "@prisma/client";

const SAFETY_FLAGS: IdentitySafetyFlag[] = ["VIOLENCE", "SEXUAL_VIOLENCE", "WAR", "SEVERE_LOSS", "SELF_HARM", "CRISIS"];
const LOCALES = ["lv", "en"] as const;
const OTHER_LOCALES = ["de", "fr", "es", "it", "ja", "zh"];

type TRow = {
  id?: string;
  entityId: string;
  field: string;
  locale: string;
  draftValue: string;
  publishedValue: string | null;
  translationStatus: string;
};

type Props = {
  belief: {
    id: string;
    stableKey: string;
    subcategoryId: string;
    sortOrder: number;
    status: string;
    safetyFlags: string[];
    adminNotes: string;
  };
  subcategoryOptions: { id: string; label: string }[];
  tags: { id: string; key: string; status: string }[];
  selectedTagIds: string[];
  trunk: { id: string; status: string } | null;
  branches: { id: string; sortOrder: number; status: string }[];
  translations: TRow[];
};

export function BeliefEditor({ belief, subcategoryOptions, tags, selectedTagIds, trunk, branches, translations }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [meta, setMeta] = useState({
    stableKey: belief.stableKey,
    subcategoryId: belief.subcategoryId,
    sortOrder: belief.sortOrder,
    adminNotes: belief.adminNotes,
  });
  const [flags, setFlags] = useState<Set<string>>(new Set(belief.safetyFlags));
  const [tagIds, setTagIds] = useState<Set<string>>(new Set(selectedTagIds));

  const t = (entityId: string, field: string, locale: string): TRow =>
    translations.find((r) => r.entityId === entityId && r.field === field && r.locale === locale) ?? {
      entityId, field, locale, draftValue: "", publishedValue: null, translationStatus: "NOT_TRANSLATED",
    };

  const Field = (entityId: string, field: string, label: string, locale: string) => {
    const row = t(entityId, field, locale);
    return (
      <TranslationField
        key={`${entityId}-${field}-${locale}`}
        entityType={entityId === belief.id ? "BELIEF" : trunk?.id === entityId ? "TRUNK" : "BRANCH"}
        entityId={entityId}
        field={field}
        locale={locale}
        label={label}
        draftValue={row.draftValue}
        publishedValue={row.publishedValue}
        translationStatus={row.translationStatus}
        translationId={row.id}
        multiline={field !== "text"}
      />
    );
  };

  return (
    <div className="layout-stack-lg">
      {/* Meta */}
      <section className="observed-card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="type-heading-sm">{belief.stableKey}</h2>
          <StatusControl
            value={belief.status}
            onSave={(s: IdentityContentStatus) => updateBeliefAction(belief.id, { status: s })}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="type-caption text-ink-subtle">StableKey</span>
            <input value={meta.stableKey} onChange={(e) => setMeta((m) => ({ ...m, stableKey: e.target.value }))}
              className="min-h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          </label>
          <label className="space-y-1">
            <span className="type-caption text-ink-subtle">Apakštēma</span>
            <select value={meta.subcategoryId} onChange={(e) => setMeta((m) => ({ ...m, subcategoryId: e.target.value }))}
              className="min-h-10 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink">
              {subcategoryOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="type-caption text-ink-subtle">Secība</span>
            <input type="number" value={meta.sortOrder} onChange={(e) => setMeta((m) => ({ ...m, sortOrder: Number(e.target.value) }))}
              className="min-h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="type-caption text-ink-subtle">Drošības karogi</legend>
          <div className="flex flex-wrap gap-3">
            {SAFETY_FLAGS.map((f) => (
              <label key={f} className="type-caption flex items-center gap-1.5 text-ink">
                <input type="checkbox" checked={flags.has(f)}
                  onChange={(e) => setFlags((p) => { const n = new Set(p); if (e.target.checked) { n.add(f); } else { n.delete(f); } return n; })} />
                {f}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block space-y-1">
          <span className="type-caption text-ink-subtle">Admin piezīmes</span>
          <textarea value={meta.adminNotes} onChange={(e) => setMeta((m) => ({ ...m, adminNotes: e.target.value }))}
            rows={2} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink" />
        </label>
        <button type="button" disabled={pending}
          onClick={() => start(async () => { await updateBeliefAction(belief.id, { ...meta, safetyFlags: [...flags] as IdentitySafetyFlag[] }); router.refresh(); })}
          className="type-caption rounded-full bg-accent px-4 py-2 text-surface disabled:opacity-40">
          Saglabāt meta
        </button>
      </section>

      {/* Tulkojumi */}
      <section className="observed-card space-y-4 p-6">
        <h3 className="type-heading-sm">Uzskata teksti</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(["text", "portraitNow", "portraitFuture"] as const).flatMap((f) =>
            LOCALES.map((l) => Field(belief.id, f, { text: "Negatīvais uzskats", portraitNow: "Portrets šodien", portraitFuture: "Portrets nākotnē" }[f], l)),
          )}
        </div>
        <details>
          <summary className="type-caption cursor-pointer text-ink-subtle">Pārējās valodas (DE/FR/ES/IT/JA/ZH)</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(["text", "portraitNow", "portraitFuture"] as const).flatMap((f) =>
              OTHER_LOCALES.map((l) => Field(belief.id, f, { text: "Belief", portraitNow: "Portrait now", portraitFuture: "Portrait future" }[f], l)),
            )}
          </div>
        </details>
      </section>

      {/* Mehānismi */}
      <section className="observed-card space-y-3 p-6">
        <h3 className="type-heading-sm">Mehānismu tagi</h3>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="type-caption flex items-center gap-1.5 text-ink">
              <input type="checkbox" checked={tagIds.has(tag.id)}
                onChange={(e) => setTagIds((p) => { const n = new Set(p); if (e.target.checked) { n.add(tag.id); } else { n.delete(tag.id); } return n; })} />
              {tag.key}
            </label>
          ))}
        </div>
        <button type="button" disabled={pending}
          onClick={() => start(async () => { await setBeliefMechanismsAction(belief.id, [...tagIds]); router.refresh(); })}
          className="type-caption rounded-full border border-border px-3 py-1.5 text-ink disabled:opacity-40">
          Saglabāt tagus
        </button>
      </section>

      {/* Stumbrs + zari */}
      <section className="observed-card space-y-4 p-6">
        <div className="flex items-center gap-3">
          <h3 className="type-heading-sm">Pozitīvais stumbrs</h3>
          {trunk ? (
            <StatusControl value={trunk.status}
              onSave={(s: IdentityContentStatus) => upsertTrunkAction(belief.id, { status: s })} />
          ) : (
            <button type="button" disabled={pending}
              onClick={() => start(async () => { await upsertTrunkAction(belief.id, {}); router.refresh(); })}
              className="type-caption rounded-full border border-border px-3 py-1.5 text-ink">
              + Izveidot stumbru
            </button>
          )}
        </div>
        {trunk ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {LOCALES.map((l) => Field(trunk.id, "text", "Stumbra teksts", l))}
            </div>
            <details>
              <summary className="type-caption cursor-pointer text-ink-subtle">Pārējās valodas</summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {OTHER_LOCALES.map((l) => Field(trunk.id, "text", "Trunk text", l))}
              </div>
            </details>
            <div className="space-y-4 border-t border-border-subtle pt-4">
              <h4 className="type-body font-medium">Zari ({branches.length})</h4>
              {branches.map((br) => (
                <details key={br.id} className="rounded-md border border-border-subtle p-3">
                  <summary className="flex cursor-pointer items-center gap-3">
                    <span className="type-caption">Zars #{br.sortOrder + 1}</span>
                    <StatusControl value={br.status}
                      onSave={(s: IdentityContentStatus) => upsertBranchAction({ id: br.id, trunkId: trunk.id, status: s })} />
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      {LOCALES.map((l) => Field(br.id, "text", "Zara teksts", l))}
                    </div>
                    <button type="button" disabled={pending}
                      onClick={() => {
                        if (!confirm("Dzēst zaru?")) return;
                        start(async () => { await deleteBranchAction(br.id); router.refresh(); });
                      }}
                      className="type-caption text-ink-subtle underline">
                      Dzēst zaru
                    </button>
                  </div>
                </details>
              ))}
              <button type="button" disabled={pending}
                onClick={() => start(async () => { await upsertBranchAction({ trunkId: trunk.id, sortOrder: branches.length }); router.refresh(); })}
                className="type-caption rounded-full border border-border px-3 py-1.5 text-ink">
                + Jauns zars
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
