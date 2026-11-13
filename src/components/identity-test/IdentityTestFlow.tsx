"use client";

import { useMemo, useState } from "react";
import type { IdentityTestContent } from "@/content/i18n/types";
import type { PublicBelief, TestContentTree } from "@/lib/identity-test/types";
import { cn } from "@/lib/utils";
import { ThemeIcon } from "./ThemeIcon";

type Step = "intro" | "themes" | "beliefs" | "review" | "email" | "done";

const STEP_ORDER: Step[] = ["intro", "themes", "beliefs", "review", "email"];

type Props = {
  tree: TestContentTree;
  ui: IdentityTestContent;
  locale: string;
  consentLabel: string;
  bookingUrl: string;
};

export function IdentityTestFlow({ tree, ui, locale, consentLabel, bookingUrl }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [themeIds, setThemeIds] = useState<Set<string>>(new Set());
  const [beliefIds, setBeliefIds] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleSubcategories = useMemo(
    () => tree.subcategories.filter((s) => themeIds.has(s.themeId)),
    [tree.subcategories, themeIds],
  );
  const beliefsBySub = useMemo(() => {
    const map = new Map<string, PublicBelief[]>();
    for (const sub of visibleSubcategories) {
      map.set(sub.id, tree.beliefs.filter((b) => b.subcategoryId === sub.id));
    }
    return map;
  }, [tree.beliefs, visibleSubcategories]);
  const subById = useMemo(
    () => new Map(tree.subcategories.map((s) => [s.id, s])),
    [tree.subcategories],
  );
  const themeById = useMemo(
    () => new Map(tree.themes.map((t) => [t.id, t])),
    [tree.themes],
  );
  const selectedBeliefs = useMemo(
    () => tree.beliefs.filter((b) => beliefIds.has(b.id)),
    [tree.beliefs, beliefIds],
  );

  const stepIndex = step === "done" ? STEP_ORDER.length - 1 : STEP_ORDER.indexOf(step);

  function toggle(set: Set<string>, id: string, apply: (next: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(next);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/identity-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          email,
          marketingConsent,
          locale,
          beliefIds: [...beliefIds],
        }),
      });
      if (res.ok) {
        setStep("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { reason?: string } | null;
      setError(data?.reason === "email_failed" ? ui.errors.sendFailed : ui.errors.generic);
    } catch {
      setError(ui.errors.sendFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const cardBase =
    "group relative w-full cursor-pointer rounded-xl border border-border bg-surface text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_10px_28px_-14px_rgb(0_0_0/0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const cardSelected = "border-accent bg-accent-soft/40";
  const checkboxClass =
    "mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-border-strong bg-surface transition-colors checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40";
  const backBtn = "type-caption text-ink-subtle transition-colors hover:text-ink";

  return (
    <div className={cn("mx-auto w-full", step === "beliefs" || step === "themes" ? "max-w-5xl" : "max-w-3xl")}>
      {step !== "intro" ? <ProgressBar ui={ui} stepIndex={stepIndex} /> : null}

      {step === "intro" ? (
        <section className="mx-auto max-w-2xl py-6 text-center md:py-12">
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4.5" opacity={0.55} />
              <circle cx="12" cy="12" r="0.7" fill="currentColor" />
            </svg>
          </div>
          <h1 className="font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            {ui.intro.title}
          </h1>
          <p className="type-body mt-4 text-lg text-ink-muted">{ui.intro.subtitle}</p>
          <div className="mx-auto mt-8 max-w-prose space-y-3">
            <p className="type-body">{ui.intro.lead}</p>
            <p className="type-caption text-ink-subtle">{ui.intro.note}</p>
          </div>
          <div className="mt-10">
            <button type="button" onClick={() => setStep("themes")} className={primaryBtn}>
              {ui.intro.startCta}
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2.5 8h11M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      ) : null}

      {step === "themes" ? (
        <section>
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h1 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
              {ui.themeStep.heading}
            </h1>
          </header>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tree.themes.map((theme) => {
              const active = themeIds.has(theme.id);
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(themeIds, theme.id, setThemeIds)}
                    className={cn(cardBase, "flex h-full flex-col gap-4 p-5", active && cardSelected)}
                  >
                    <span className="flex items-start justify-between">
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                          active ? "bg-accent text-surface" : "bg-surface-muted text-accent group-hover:bg-accent-soft",
                        )}
                      >
                        <ThemeIcon slug={theme.slug} className="h-6 w-6" />
                      </span>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                          active
                            ? "border-accent bg-accent text-surface"
                            : "border-border-strong text-transparent group-hover:border-accent/60",
                        )}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="m2.5 6.2 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </span>
                    <span className="space-y-1.5">
                      <span className="type-body block font-medium text-ink">{theme.name}</span>
                      {theme.description ? (
                        <span className="type-caption block text-ink-muted">{theme.description}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}

            <li className="sm:col-span-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => {
                  setThemeIds(new Set(tree.themes.map((t) => t.id)));
                  setStep("beliefs");
                }}
                className={cn(
                  cardBase,
                  "flex w-full items-center justify-between gap-4 bg-accent-soft/50 px-6 py-5",
                )}
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-surface">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="4" width="7" height="7" rx="1.5" />
                      <rect x="13" y="4" width="7" height="7" rx="1.5" />
                      <rect x="4" y="13" width="7" height="7" rx="1.5" />
                      <rect x="13" y="13" width="7" height="7" rx="1.5" />
                    </svg>
                  </span>
                  <span className="type-body font-medium text-ink">{ui.themeStep.allThemes}</span>
                </span>
                <svg viewBox="0 0 16 16" className="h-5 w-5 text-accent transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2.5 8h11M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </li>
          </ul>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button type="button" onClick={() => setStep("intro")} className={backBtn}>
              ← {ui.themeStep.back}
            </button>
            <button type="button" disabled={themeIds.size === 0} onClick={() => setStep("beliefs")} className={primaryBtn}>
              {ui.themeStep.next}
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2.5 8h11M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      ) : null}

      {step === "beliefs" ? (
        <section className="pb-28">
          {visibleSubcategories.map((sub) => {
            const beliefs = beliefsBySub.get(sub.id) ?? [];
            if (beliefs.length === 0) return null;
            const theme = themeById.get(sub.themeId);
            return (
              <fieldset key={sub.id} className="mb-10">
                <legend className="sr-only">{sub.name}</legend>
                <div className="mb-4 flex items-baseline gap-3">
                  {theme ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-accent">
                      <ThemeIcon slug={theme.slug} className="h-4 w-4" />
                    </span>
                  ) : null}
                  <div>
                    <h2 className="font-display text-xl tracking-tight text-ink">{sub.name}</h2>
                    {theme ? <p className="type-caption text-ink-faint">{theme.name}</p> : null}
                  </div>
                </div>
                <ul className="grid gap-3 md:grid-cols-2">
                  {beliefs.map((belief) => {
                    const active = beliefIds.has(belief.id);
                    return (
                      <li key={belief.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggle(beliefIds, belief.id, setBeliefIds)}
                          className={cn(cardBase, "flex h-full items-start gap-3 p-4", active && cardSelected)}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                              active
                                ? "border-accent bg-accent text-surface"
                                : "border-border-strong text-transparent group-hover:border-accent/60",
                            )}
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="m2.5 6.2 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span className="type-body">{belief.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}

          {/* Lipīgā apakšējā josla: skaits + turpināšana (ērta arī mobilajā) */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-canvas/90 backdrop-blur-sm">
            <div className="layout-container flex items-center justify-between gap-4 py-4">
              <button type="button" onClick={() => setStep("themes")} className={backBtn}>
                ← {ui.beliefStep.back}
              </button>
              <p className="type-caption text-ink-subtle" aria-live="polite">
                <span className="font-display text-lg text-ink">{beliefIds.size}</span>{" "}
                {ui.beliefStep.selectedSuffix}
              </p>
              <button type="button" disabled={beliefIds.size === 0} onClick={() => setStep("review")} className={primaryBtn}>
                {ui.beliefStep.next}
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2.5 8h11M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {step === "review" ? (
        <section className="mx-auto max-w-2xl">
          <header className="mb-8 text-center">
            <h1 className="font-display text-3xl tracking-tight text-ink">{ui.review.heading}</h1>
            <p className="type-caption mt-2 text-ink-subtle">{ui.review.subheading}</p>
            <p className="type-caption mt-1 text-ink-faint">
              <span className="font-display text-base text-ink">{selectedBeliefs.length}</span>{" "}
              {ui.beliefStep.selectedSuffix}
            </p>
          </header>

          <ul className="space-y-3">
            {selectedBeliefs.map((belief) => {
              const sub = subById.get(belief.subcategoryId);
              return (
                <li
                  key={belief.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <div>
                    <span className="type-body">{belief.text}</span>
                    {sub ? <p className="type-caption mt-1 text-ink-faint">{sub.name}</p> : null}
                  </div>
                  <button
                    type="button"
                    aria-label="×"
                    onClick={() => toggle(beliefIds, belief.id, setBeliefIds)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button type="button" onClick={() => setStep("beliefs")} className={backBtn}>
              ← {ui.review.back}
            </button>
            <button type="button" disabled={beliefIds.size === 0} onClick={() => setStep("email")} className={primaryBtn}>
              {ui.review.submitCta}
            </button>
          </div>
        </section>
      ) : null}

      {step === "email" ? (
        <section className="mx-auto max-w-xl">
          <header className="mb-8 text-center">
            <h1 className="font-display text-3xl tracking-tight text-ink">{ui.emailStep.heading}</h1>
          </header>
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
            <div className="layout-stack-sm mb-6">
              <p className="type-body">{ui.emailStep.lead}</p>
              <p className="type-body text-ink-muted">{ui.emailStep.lead1}</p>
              <p className="type-body text-ink-muted">{ui.emailStep.lead2}</p>
            </div>

            <div className="layout-stack-sm">
              <label htmlFor="identity-email" className="type-caption font-medium">
                {ui.emailStep.emailLabel}
              </label>
              <input
                id="identity-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={ui.emailStep.emailPlaceholder}
                className="min-h-12 w-full rounded-lg border border-border bg-canvas px-4 text-base text-ink transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>

            {consentLabel ? (
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg bg-surface-muted p-3.5">
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                />
                <span className="type-caption text-ink-muted">{consentLabel}</span>
              </label>
            ) : null}

            <p className="type-caption mt-5 text-ink-faint">{ui.emailStep.privacyNote}</p>

            {error ? (
              <p role="alert" className="type-caption mt-4 text-red-700">{error}</p>
            ) : null}

            <div className="mt-7 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep("review")} className={backBtn}>
                ← {ui.review.back}
              </button>
              <div className="flex items-center gap-3">
                {error ? (
                  <button type="button" onClick={submit} className="type-caption text-accent hover:text-accent-strong">
                    {ui.errors.retry}
                  </button>
                ) : null}
                <button type="button" disabled={submitting || !email} onClick={submit} className={primaryBtn}>
                  {submitting ? ui.emailStep.sendingLabel : ui.emailStep.submitCta}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className="mx-auto max-w-xl py-8 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12.5 9.5 18 20 6.5" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink">{ui.confirmation.heading}</h1>
          <p className="type-body mt-4">{ui.confirmation.body}</p>
          <p className="type-caption mt-2 text-ink-subtle">{ui.confirmation.spamNote}</p>
          {locale === "lv" ? null : (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
              <p className="type-body max-w-prose">{ui.confirmation.sessionLead}</p>
              <a href={bookingUrl} className={cn(primaryBtn, "mt-5 bg-booking hover:bg-booking-strong")}>
                {ui.confirmation.sessionCta}
              </a>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function ProgressBar({ ui, stepIndex }: { ui: IdentityTestContent; stepIndex: number }) {
  return (
    <ol className="mx-auto mb-12 flex max-w-2xl items-center" aria-label="progress">
      {ui.steps.map((label, index) => {
        const done = index < stepIndex;
        const current = index === stepIndex;
        return (
          <li key={label} className={cn("flex items-center", index > 0 && "flex-1")}>
            {index > 0 ? (
              <span
                className={cn(
                  "mx-2 h-px flex-1 transition-colors duration-300",
                  index <= stepIndex ? "bg-accent" : "bg-border",
                )}
                aria-hidden="true"
              />
            ) : null}
            <span className="flex flex-col items-center gap-1.5" aria-current={current ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-300",
                  done && "border-accent bg-accent text-surface",
                  current && "border-accent bg-surface text-accent",
                  !done && !current && "border-border bg-surface text-ink-faint",
                )}
              >
                {done ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m2.5 6.2 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] sm:block",
                  current ? "font-medium text-ink" : done ? "text-ink-muted" : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
