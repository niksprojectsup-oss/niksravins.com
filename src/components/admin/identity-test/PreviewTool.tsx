"use client";

import { useMemo, useState, useTransition } from "react";
import { previewCompositionAction } from "@/lib/admin/actions/identity-test";

const LOCALES = ["lv", "en", "de", "fr", "es", "it", "ja", "zh"];

export function PreviewTool({ beliefs }: { beliefs: { id: string; stableKey: string; label: string }[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [locale, setLocale] = useState("lv");
  const [result, setResult] = useState<{ portraitNow: string; portraitFuture: string; warnings: string[] } | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(
    () => beliefs.filter((b) => b.stableKey.toLowerCase().includes(query.toLowerCase()) || b.label.toLowerCase().includes(query.toLowerCase())).slice(0, 30),
    [beliefs, query],
  );

  return (
    <div className="layout-stack-lg">
      <section className="observed-card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Meklēt uzskatu (stableKey vai teksts)"
            className="min-h-10 w-80 rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          <select value={locale} onChange={(e) => setLocale(e.target.value)}
            className="min-h-10 rounded-md border border-border bg-surface px-2 text-sm text-ink">
            {LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
          <button type="button" disabled={pending || selected.length === 0}
            onClick={() => start(async () => {
              const r = await previewCompositionAction({ beliefIds: selected, locale });
              if (r.ok) setResult(r);
            })}
            className="type-caption rounded-full bg-accent px-4 py-2 text-surface disabled:opacity-40">
            Ģenerēt priekšskatījumu ({selected.length})
          </button>
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border-subtle p-2">
          {filtered.map((b) => (
            <label key={b.id} className="flex items-center gap-2 px-2 py-1 text-sm">
              <input type="checkbox" checked={selected.includes(b.id)}
                onChange={(e) => setSelected((p) => e.target.checked ? [...p, b.id] : p.filter((x) => x !== b.id))} />
              <span className="font-mono text-xs text-ink-faint">{b.stableKey}</span>
              <span className="truncate">{b.label}</span>
            </label>
          ))}
        </div>
      </section>

      {result ? (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="observed-card p-6">
            <h3 className="type-heading-sm">Portrets šodien</h3>
            <p className="type-body mt-3 whitespace-pre-wrap">{result.portraitNow || "(tukšs)"}</p>
          </article>
          <article className="observed-card p-6">
            <h3 className="type-heading-sm">Portrets nākotnē</h3>
            <p className="type-body mt-3 whitespace-pre-wrap">{result.portraitFuture || "(tukšs)"}</p>
          </article>
          {result.warnings.length ? (
            <article className="observed-card p-6 md:col-span-2">
              <h3 className="type-heading-sm">Brīdinājumi</h3>
              <ul className="type-caption mt-2 list-disc pl-5 text-ink-subtle">
                {result.warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </article>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
