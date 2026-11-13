"use client";

import { useState } from "react";
import { createBetaInviteAction, revokeBetaInviteAction } from "@/lib/admin/actions/identity-test";

type Invite = {
  id: string;
  label: string;
  uses: number;
  maxUses: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export function BetaInviteManager({ invites }: { invites: Invite[] }) {
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(5);
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [locale, setLocale] = useState<"lv" | "en">("lv");
  const [busy, setBusy] = useState(false);
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const r = await createBetaInviteAction({ label: label || "Beta testētājs", maxUses, expiresInDays, locale });
    setBusy(false);
    if (r.ok && r.url) setNewUrl(r.url);
    else setError("Izveide neizdevās");
  }

  return (
    <div className="layout-stack-md">
      <div className="rounded-md border border-border-subtle bg-surface p-4">
        <h2 className="type-caption mb-3 font-medium text-ink">Jauna uzaicinājuma saite</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="type-caption flex min-w-48 flex-1 flex-col gap-1">
            Testētājs / piezīme
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="piem., Anna B."
              className="min-h-9 rounded-md border border-border bg-canvas px-3 text-sm"
            />
          </label>
          <label className="type-caption flex w-24 flex-col gap-1">
            Lietojumi
            <input
              type="number" min={1} max={100} value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="min-h-9 rounded-md border border-border bg-canvas px-3 text-sm"
            />
          </label>
          <label className="type-caption flex w-28 flex-col gap-1">
            Derīgs (dienas)
            <input
              type="number" min={1} max={365} value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="min-h-9 rounded-md border border-border bg-canvas px-3 text-sm"
            />
          </label>
          <label className="type-caption flex w-24 flex-col gap-1">
            Valoda
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "lv" | "en")}
              className="min-h-9 rounded-md border border-border bg-canvas px-2 text-sm"
            >
              <option value="lv">LV</option>
              <option value="en">EN</option>
            </select>
          </label>
          <button
            type="button"
            onClick={create}
            disabled={busy}
            className="min-h-9 rounded-md bg-accent px-4 text-sm font-medium text-surface hover:bg-accent-strong disabled:opacity-50"
          >
            Izveidot saiti
          </button>
        </div>
        {newUrl ? (
          <div className="mt-4 rounded-md border border-accent/40 bg-accent-soft/40 p-3">
            <p className="type-caption mb-1 font-medium text-ink">Saites redzama tikai šo reizi — nokopē:</p>
            <code className="block break-all rounded bg-surface px-3 py-2 text-xs text-ink">{newUrl}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(newUrl)}
              className="type-caption mt-2 text-accent hover:text-accent-strong"
            >
              Kopēt
            </button>
          </div>
        ) : null}
        {error ? <p className="type-caption mt-2 text-red-700">{error}</p> : null}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            {["Piezīme", "Lietojumi", "Derīgs līdz", "Statuss", "Izveidots", ""].map((h) => (
              <th key={h} className="type-caption px-3 py-2 text-ink-subtle">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invites.map((i) => {
            const expired = new Date(i.expiresAt) <= new Date();
            const usedUp = i.uses >= i.maxUses;
            const status = i.revokedAt ? "Atsaukta" : expired ? "Beidzies" : usedUp ? "Izlietota" : "Aktīva";
            return (
              <tr key={i.id} className="border-b border-border-subtle">
                <td className="px-3 py-2">{i.label}</td>
                <td className="px-3 py-2">{i.uses}/{i.maxUses}</td>
                <td className="px-3 py-2">{new Date(i.expiresAt).toLocaleDateString("lv-LV")}</td>
                <td className="px-3 py-2">{status}</td>
                <td className="px-3 py-2 text-ink-subtle">{new Date(i.createdAt).toLocaleDateString("lv-LV")}</td>
                <td className="px-3 py-2">
                  {!i.revokedAt && !expired && !usedUp ? (
                    <button
                      type="button"
                      onClick={() => revokeBetaInviteAction(i.id)}
                      className="type-caption text-red-700 hover:underline"
                    >
                      Atsaukt
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
          {invites.length === 0 ? (
            <tr><td colSpan={6} className="px-3 py-6 text-center text-ink-subtle">Nav uzaicinājumu</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
