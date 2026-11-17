"use client";

import { useState, useTransition } from "react";
import type {
  AdminDevelopmentCard,
  AdminDevTrunk,
} from "@/lib/development/repository";
import {
  addBranchToTrunk,
  addCustomTrunk,
  addTrunkFromLibrary,
  assignTrunkSession,
  completeTrunk,
  linkBeliefToLibraryTrunk,
  reopenTrunk,
  setBranchDone,
} from "@/lib/admin/actions/development";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Nav sākts",
  IN_PROGRESS: "Procesā",
  COMPLETED: "Pabeigts",
  NEEDS_SUPPLEMENT: "Papildināms",
};
const STATUS_CLASS: Record<string, string> = {
  NOT_STARTED: "bg-surface-subtle text-ink-subtle",
  IN_PROGRESS: "bg-accent/10 text-accent",
  COMPLETED: "bg-green-100 text-green-800",
  NEEDS_SUPPLEMENT: "bg-amber-100 text-amber-800",
};

function TrunkCard({
  clientId,
  trunk,
  sessions,
}: {
  clientId: string;
  trunk: AdminDevTrunk;
  sessions: AdminDevelopmentCard["sessions"];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [addingBranch, setAddingBranch] = useState(false);
  const [branchText, setBranchText] = useState("");
  const undone = trunk.branches.filter((b) => !b.done).length;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError("");
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Kļūda");
    });

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {trunk.libraryKey && (
              <span className="type-caption text-ink-subtle font-mono">{trunk.libraryKey}</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[trunk.status]}`}>
              {STATUS_LABEL[trunk.status]}
            </span>
            {trunk.origin === "CUSTOM" && (
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-ink-subtle">individuāls</span>
            )}
          </div>
          <p className="type-body mt-1 font-medium text-ink">{trunk.titleLv}</p>
          {trunk.titleEn && <p className="type-caption text-ink-subtle italic">{trunk.titleEn}</p>}
          {trunk.negativeBelief && (
            <p className="type-caption mt-1 text-ink-subtle">Negatīvais: {trunk.negativeBelief}</p>
          )}
          {trunk.completedAt && (
            <p className="type-caption text-ink-subtle">
              Pabeigts {new Date(trunk.completedAt).toLocaleDateString("lv-LV")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {trunk.status !== "COMPLETED" && (
            <button
              type="button"
              disabled={isPending || undone > 0}
              title={undone > 0 ? `Neizstrādāti ${undone} zari` : ""}
              onClick={() =>
                run(() =>
                  completeTrunk({ clientId, clientTrunkId: trunk.id, sessionId: trunk.sessionId }),
                )
              }
              className="rounded-lg bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-40"
            >
              Atzīmēt stumbru kā pabeigtu{undone > 0 ? ` (${undone} zari atlikuši)` : ""}
            </button>
          )}
          {trunk.status === "COMPLETED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                const reason = window.prompt("Atvēršanas iemesls (tiks saglabāts vēsturē):");
                if (reason) run(() => reopenTrunk({ clientId, clientTrunkId: trunk.id, reason }));
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-subtle"
            >
              Atvērt atpakaļ
            </button>
          )}
          <select
            disabled={isPending}
            value={trunk.sessionId ?? ""}
            onChange={(e) =>
              run(() =>
                assignTrunkSession({
                  clientId, clientTrunkId: trunk.id, sessionId: e.target.value || null,
                }),
              )
            }
            className="rounded-lg border border-border px-2 py-1 text-sm"
          >
            <option value="">- saistīt ar sesiju -</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sessionNumber ? `#${s.sessionNumber} ` : ""}
                {new Date(s.scheduledAt).toLocaleDateString("lv-LV")} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {trunk.branches.map((b) => (
          <li key={b.id}>
            <label className="flex items-start gap-3 type-body text-ink cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border-strong accent-accent"
                checked={b.done}
                disabled={isPending || trunk.status === "COMPLETED"}
                onChange={(e) =>
                  run(() => setBranchDone({ clientId, branchId: b.id, done: e.target.checked }))
                }
              />
              <span className={b.done ? "text-ink-subtle line-through" : ""}>{b.textLv}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        {addingBranch ? (
          <div className="flex gap-2">
            <input
              value={branchText}
              onChange={(e) => setBranchText(e.target.value)}
              placeholder="Jaunā zara formulējums"
              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              disabled={isPending || !branchText.trim()}
              onClick={() =>
                run(async () => {
                  const r = await addBranchToTrunk({ clientId, clientTrunkId: trunk.id, textLv: branchText });
                  if (r.ok) { setBranchText(""); setAddingBranch(false); }
                  return r;
                })
              }
              className="rounded-lg bg-accent px-3 py-1.5 text-sm text-white"
            >
              Saglabāt
            </button>
            <button type="button" onClick={() => setAddingBranch(false)} className="text-sm text-ink-subtle">
              Atcelt
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setAddingBranch(true)} className="text-sm text-accent">
            + Pievienot zaru
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function DevelopmentWorkCard({
  clientId,
  card,
}: {
  clientId: string;
  card: AdminDevelopmentCard;
}) {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"plan" | "beliefs" | "tests" | "history">("plan");
  const [addMode, setAddMode] = useState<"library" | "custom" | null>(null);
  const [libraryPick, setLibraryPick] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customBranches, setCustomBranches] = useState("");
  const [beliefForCustom, setBeliefForCustom] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { progress } = card;

  const tabs = [
    { key: "plan" as const, label: `Darba plāns (${card.trunks.length})` },
    { key: "beliefs" as const, label: "Negatīvie uzskati" },
    { key: "tests" as const, label: `Testi (${card.submissions.length})` },
    { key: "history" as const, label: "Vēsture" },
  ];

  const usedLibraryIds = new Set(
    card.trunks.map((t) => t.libraryKey).filter(Boolean),
  );

  return (
    <section className="observed-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="layout-stack-sm">
          <h2 className="type-heading-sm">Attīstības darba karte</h2>
          <p className="type-body text-ink-subtle">
            Identitātes tests → negatīvie uzskati → stumbri un zari → progress.
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="flex items-baseline justify-between">
            <span className="type-caption text-ink-subtle">Progress</span>
            <span className="type-heading-sm">{progress.percent}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="type-caption mt-1 text-ink-subtle">
            {progress.completedTrunks}/{progress.totalTrunks} pabeigti ·{" "}
            {progress.remainingTrunks} atlikuši
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm ${tab === t.key ? "border-b-2 border-accent text-accent" : "text-ink-subtle"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div className="mt-5 space-y-4">
          {card.trunks.length === 0 && (
            <p className="type-body text-ink-subtle">
              Vēl nav neviena stumbra. Pievieno no kartotēkas vai individuāli.
            </p>
          )}
          {card.trunks.map((t) => (
            <TrunkCard key={t.id} clientId={clientId} trunk={t} sessions={card.sessions} />
          ))}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setAddMode(addMode === "library" ? null : "library")} className="rounded-lg border border-accent px-3 py-1.5 text-sm text-accent">
              + Pievienot stumbru no kartotēkas
            </button>
            <button type="button" onClick={() => setAddMode(addMode === "custom" ? null : "custom")} className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink">
              + Individuāls stumbrs
            </button>
          </div>

          {addMode === "library" && (
            <div className="rounded-2xl border border-border p-4">
              <select value={libraryPick} onChange={(e) => setLibraryPick(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="">- izvēlies kartotēkas stumbru -</option>
                {card.libraryTrunks
                  .filter((t) => !usedLibraryIds.has(t.libraryKey))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.libraryKey} · {t.themeTitle} - {t.titleLv.slice(0, 90)}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={isPending || !libraryPick}
                onClick={() =>
                  startTransition(async () => {
                    setError("");
                    const r = await addTrunkFromLibrary({ clientId, libraryTrunkId: libraryPick });
                    if (!r.ok) setError(r.error ?? "Kļūda");
                    else { setLibraryPick(""); setAddMode(null); }
                  })
                }
                className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                Pievienot plānam
              </button>
            </div>
          )}

          {addMode === "custom" && (
            <div className="rounded-2xl border border-border p-4 space-y-2">
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Stumbra formulējums (LV)"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <textarea
                value={customBranches}
                onChange={(e) => setCustomBranches(e.target.value)}
                placeholder="Zari - katrs jaunā rindā"
                rows={4}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={isPending || !customTitle.trim()}
                onClick={() =>
                  startTransition(async () => {
                    setError("");
                    const r = await addCustomTrunk({
                      clientId, titleLv: customTitle, beliefId: beliefForCustom,
                      branches: customBranches.split("\n").filter(Boolean).map((t) => ({ textLv: t })),
                    });
                    if (!r.ok) setError(r.error ?? "Kļūda");
                    else { setCustomTitle(""); setCustomBranches(""); setAddMode(null); }
                  })
                }
                className="rounded-lg bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                Izveidot stumbru
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {tab === "beliefs" && (
        <div className="mt-5 space-y-5">
          {card.submissions.length === 0 && (
            <p className="type-body text-ink-subtle">Nav piesaistītu testa iesniegumu.</p>
          )}
          {card.submissions.map((s) => {
            const byTheme = new Map<string, typeof s.beliefs>();
            for (const b of s.beliefs) {
              const arr = byTheme.get(b.themeName) ?? [];
              arr.push(b);
              byTheme.set(b.themeName, arr);
            }
            return (
              <div key={s.id}>
                <p className="type-caption text-ink-subtle">
                  Iesniegts {new Date(s.createdAt).toLocaleString("lv-LV")} · {s.locale.toUpperCase()}
                  {s.safetyTriggered && <span className="ml-2 text-red-600">drošības karogs</span>}
                </p>
                {[...byTheme.entries()].map(([theme, items]) => (
                  <div key={theme} className="mt-3">
                    <h4 className="type-caption font-medium text-ink">
                      {theme}
                      {items.some((i) => i.isSensitiveTheme) && (
                        <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">sensitīva tēma</span>
                      )}
                    </h4>
                    <ul className="mt-1 space-y-1">
                      {items.map((b) => (
                        <li key={b.beliefId} className="type-body text-ink flex items-baseline gap-2">
                          <span className="text-ink-subtle">·</span>
                          <span className="flex-1">{b.text || b.stableKey}</span>
                          {b.linkedLibraryTrunk ? (
                            <span className="type-caption text-ink-subtle">→ {b.linkedLibraryTrunk.libraryKey}</span>
                          ) : (
                            <select
                              disabled={isPending}
                              defaultValue=""
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === "__custom__") {
                                  setBeliefForCustom(b.beliefId);
                                  setTab("plan");
                                  setAddMode("custom");
                                } else if (v) {
                                  startTransition(async () => {
                                    await linkBeliefToLibraryTrunk({ clientId, beliefId: b.beliefId, libraryTrunkId: v });
                                  });
                                }
                              }}
                              className="max-w-[220px] rounded border border-amber-300 px-1.5 py-0.5 text-xs text-amber-800"
                            >
                              <option value="">nav sasaistīts - izvēlies...</option>
                              {card.libraryTrunks.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.libraryKey} {t.titleLv.slice(0, 60)}
                                </option>
                              ))}
                              <option value="__custom__">+ individuāls stumbrs</option>
                            </select>
                          )}
                          {b.linkedLibraryTrunk && !b.addedToPlan && (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  await addTrunkFromLibrary({
                                    clientId,
                                    libraryTrunkId: b.linkedLibraryTrunk!.id,
                                    beliefId: b.beliefId,
                                  });
                                })
                              }
                              className="type-caption text-accent underline"
                            >
                              → plānam
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab === "tests" && (
        <div className="mt-5">
          {card.submissions.length === 0 ? (
            <p className="type-body text-ink-subtle">Nav piesaistītu testa iesniegumu.</p>
          ) : (
            <ul className="space-y-2">
              {card.submissions.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                  <span className="type-body">
                    {new Date(s.createdAt).toLocaleString("lv-LV")} · {s.locale.toUpperCase()} ·{" "}
                    {s.beliefs.length} uzskati
                  </span>
                  <span className={`type-caption ${s.linkStatus === "LINKED" ? "text-green-700" : "text-amber-700"}`}>
                    {s.linkStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="mt-5">
          {card.history.length === 0 ? (
            <p className="type-body text-ink-subtle">Vēstures ierakstu nav.</p>
          ) : (
            <ul className="space-y-1.5">
              {card.history.map((h) => (
                <li key={h.id} className="type-caption text-ink-subtle">
                  {new Date(h.createdAt).toLocaleString("lv-LV")} - <span className="font-medium text-ink">{h.action}</span>
                  {h.prevStatus && ` (${h.prevStatus} → ${h.newStatus})`}
                  {h.detail && ` · ${h.detail}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
