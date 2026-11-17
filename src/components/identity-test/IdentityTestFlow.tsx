"use client";

import { useEffect, useMemo, useState } from "react";
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

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2.5 8h11M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m2.5 6.2 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IdentityTestFlow({ tree, ui, locale, consentLabel, bookingUrl }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [themeIds, setThemeIds] = useState<Set<string>>(new Set());
  const [beliefIds, setBeliefIds] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Soļu maiņa ir klienta pusē bez navigācijas - mobīlajā versijā
  // lapa paliktu tajā pašā scroll pozīcijā; katru soli sākam no augšas.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

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

  // ── Kopējā vizuālā valoda ─────────────────────────────────────
  const cardBase =
    "group relative w-full cursor-pointer rounded-2xl border border-border-subtle bg-surface text-left shadow-[0_1px_2px_rgb(26_25_23/0.03)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_16px_40px_-20px_rgb(26_25_23/0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const cardSelected =
    "border-accent/70 bg-accent-soft/40 shadow-[0_0_0_1px_var(--nr-accent-soft),0_16px_40px_-24px_rgb(79_107_98/0.45)]";
  const checkboxClass =
    "mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-[5px] border border-border-strong bg-surface transition-colors checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const primaryBtn =
    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-accent px-8 text-[15px] font-medium tracking-tight text-surface transition-all duration-200 ease-out hover:bg-accent-strong hover:shadow-[0_10px_24px_-10px_rgb(61_85_77/0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100";
  const backBtn =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 type-caption text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink";

  const checkDot = (active: boolean) =>
    cn(
      "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-all duration-200",
      active
        ? "border-accent bg-accent text-surface"
        : "border-border-strong text-transparent group-hover:border-accent/50",
    );

  return (
    <div
      className={cn(
        "mx-auto w-full",
        step === "beliefs" || step === "themes" ? "max-w-5xl" : "max-w-2xl",
      )}
    >
      {step !== "intro" ? <ProgressBar ui={ui} stepIndex={stepIndex} /> : null}

      <div key={step} className="it-step-enter">
        {step === "intro" ? (
          <section className="mx-auto max-w-2xl py-10 text-center md:py-16">
            <div className="it-fade-in mx-auto mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4.5" opacity={0.55} />
                <circle cx="12" cy="12" r="0.7" fill="currentColor" />
              </svg>
            </div>
            <div className="it-stagger">
              <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-ink md:text-6xl">
                {ui.intro.title}
              </h1>
              <p className="mx-auto mt-5 max-w-xl font-display text-xl tracking-tight text-ink-muted md:text-2xl">
                {ui.intro.subtitle}
              </p>
              <div className="mx-auto mt-9 max-w-prose space-y-3">
                <p className="type-body">{ui.intro.lead}</p>
                <p className="type-caption text-ink-subtle">{ui.intro.note}</p>
              </div>
              <div className="mt-12">
                <button type="button" onClick={() => setStep("themes")} className={cn(primaryBtn, "group")}>
                  {ui.intro.startCta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {step === "themes" ? (
          <section>
            <header className="mx-auto mb-12 max-w-2xl text-center">
              <h1 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
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
                      className={cn(cardBase, "flex h-full flex-col gap-5 p-6", active && cardSelected)}
                    >
                      <span className="flex items-start justify-between">
                        <span
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                            active
                              ? "bg-accent text-surface"
                              : "bg-surface-muted text-accent group-hover:bg-accent-soft",
                          )}
                        >
                          <ThemeIcon slug={theme.slug} className="h-6 w-6" />
                        </span>
                        <span className={checkDot(active)} aria-hidden="true">
                          {active ? <CheckMark className="it-check-pop h-3 w-3" /> : <CheckMark className="h-3 w-3" />}
                        </span>
                      </span>
                      <span className="space-y-1.5">
                        <span className="type-body block font-medium tracking-tight text-ink">{theme.name}</span>
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
                    "flex w-full items-center justify-between gap-4 border-accent/30 bg-accent-soft/40 px-6 py-5",
                  )}
                >
                  <span className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="4" width="7" height="7" rx="1.5" />
                        <rect x="13" y="4" width="7" height="7" rx="1.5" />
                        <rect x="4" y="13" width="7" height="7" rx="1.5" />
                        <rect x="13" y="13" width="7" height="7" rx="1.5" />
                      </svg>
                    </span>
                    <span className="type-body font-medium tracking-tight text-ink">{ui.themeStep.allThemes}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-accent transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </li>
            </ul>

            <div className="mt-12 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep("intro")} className={backBtn}>
                ← {ui.themeStep.back}
              </button>
              <button type="button" disabled={themeIds.size === 0} onClick={() => setStep("beliefs")} className={primaryBtn}>
                {ui.themeStep.next}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        {step === "beliefs" ? (
          <section className="pb-32">
            {visibleSubcategories.map((sub) => {
              const beliefs = beliefsBySub.get(sub.id) ?? [];
              if (beliefs.length === 0) return null;
              const theme = themeById.get(sub.themeId);
              return (
                <fieldset key={sub.id} className="mb-12">
                  <legend className="sr-only">{sub.name}</legend>
                  <div className="mb-5 flex items-center gap-3.5">
                    {theme ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-accent">
                        <ThemeIcon slug={theme.slug} className="h-[18px] w-[18px]" />
                      </span>
                    ) : null}
                    <div>
                      <h2 className="font-display text-xl tracking-tight text-ink md:text-2xl">{sub.name}</h2>
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
                            className={cn(cardBase, "flex h-full items-start gap-3.5 p-5", active && cardSelected)}
                          >
                            <span className={checkDot(active)} aria-hidden="true">
                              {active ? <CheckMark className="it-check-pop h-3 w-3" /> : <CheckMark className="h-3 w-3" />}
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
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-canvas/80 backdrop-blur-md">
              <div className="layout-container flex items-center justify-between gap-3 py-3.5">
                <button type="button" onClick={() => setStep("themes")} className={backBtn}>
                  ← {ui.beliefStep.back}
                </button>
                <p className="type-caption text-ink-subtle" aria-live="polite">
                  <span className="font-display text-lg text-ink">{beliefIds.size}</span>{" "}
                  {ui.beliefStep.selectedSuffix}
                </p>
                <button type="button" disabled={beliefIds.size === 0} onClick={() => setStep("review")} className={primaryBtn}>
                  {ui.beliefStep.next}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {step === "review" ? (
          <section className="mx-auto max-w-2xl">
            <header className="mb-10 text-center">
              <h1 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                {ui.review.heading}
              </h1>
              <p className="type-caption mt-3 text-ink-subtle">{ui.review.subheading}</p>
              <p className="type-caption mt-2 text-ink-faint">
                <span className="font-display text-base text-ink">{selectedBeliefs.length}</span>{" "}
                {ui.beliefStep.selectedSuffix}
              </p>
            </header>

            <ul className="space-y-2.5">
              {selectedBeliefs.map((belief) => {
                const sub = subById.get(belief.subcategoryId);
                return (
                  <li
                    key={belief.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface px-5 py-4 shadow-[0_1px_2px_rgb(26_25_23/0.03)] transition-colors hover:border-border"
                  >
                    <div>
                      <span className="type-body">{belief.text}</span>
                      {sub ? <p className="type-caption mt-1.5 text-ink-faint">{sub.name}</p> : null}
                    </div>
                    <button
                      type="button"
                      aria-label="×"
                      onClick={() => toggle(beliefIds, belief.id, setBeliefIds)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 flex items-center justify-between gap-4">
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
            <header className="mb-10 text-center">
              <h1 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                {ui.emailStep.heading}
              </h1>
            </header>
            <div className="rounded-3xl border border-border-subtle bg-surface p-7 shadow-[0_1px_2px_rgb(26_25_23/0.03),0_24px_48px_-32px_rgb(26_25_23/0.12)] md:p-10">
              <div className="layout-stack-sm mb-7">
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
                  className="min-h-[52px] w-full rounded-xl border border-border bg-canvas px-4.5 text-base text-ink shadow-[inset_0_1px_2px_rgb(26_25_23/0.04)] transition-all duration-200 placeholder:text-ink-faint focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </div>

              {consentLabel ? (
                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-surface-muted/70 p-4 transition-colors hover:bg-surface-muted">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                  />
                  <span className="type-caption text-ink-muted">{consentLabel}</span>
                </label>
              ) : null}

              <p className="type-caption mt-6 text-ink-faint">{ui.emailStep.privacyNote}</p>

              {error ? (
                <p role="alert" className="type-caption mt-4 text-red-700">{error}</p>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button type="button" onClick={() => setStep("review")} className={backBtn}>
                  ← {ui.review.back}
                </button>
                <div className="flex items-center gap-3">
                  {error ? (
                    <button type="button" onClick={submit} className="type-caption font-medium text-accent transition-colors hover:text-accent-strong">
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
          <section className="mx-auto max-w-xl py-10 text-center md:py-14">
            <div className="mx-auto mb-9 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft text-accent">
              <svg viewBox="0 0 24 24" className="it-check-pop h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12.5 9.5 18 20 6.5" />
              </svg>
            </div>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {ui.confirmation.heading}
            </h1>
            <p className="type-body mt-5">{ui.confirmation.body}</p>
            <p className="type-caption mt-2.5 text-ink-subtle">{ui.confirmation.spamNote}</p>
            {locale === "lv" ? null : (
              <div className="mt-12 rounded-3xl border border-border-subtle bg-surface p-8 shadow-[0_1px_2px_rgb(26_25_23/0.03),0_24px_48px_-32px_rgb(26_25_23/0.12)]">
                <p className="type-body mx-auto max-w-prose">{ui.confirmation.sessionLead}</p>
                <a
                  href={bookingUrl}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-booking px-8 text-[15px] font-medium tracking-tight text-surface transition-all duration-200 ease-out hover:bg-booking-strong hover:shadow-[0_10px_24px_-10px_rgb(49_87_68/0.5)] active:scale-[0.98]"
                >
                  {ui.confirmation.sessionCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ProgressBar({ ui, stepIndex }: { ui: IdentityTestContent; stepIndex: number }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl">
      <ol className="flex items-center" aria-label="progress">
        {ui.steps.map((label, index) => {
          const done = index < stepIndex;
          const current = index === stepIndex;
          return (
            <li key={label} className={cn("flex items-center", index > 0 && "flex-1")}>
              {index > 0 ? (
                <span
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors duration-500",
                    index <= stepIndex ? "bg-accent" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span className="flex flex-col items-center gap-2" aria-current={current ? "step" : undefined}>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-300",
                    done && "border-accent bg-accent text-surface",
                    current && "border-accent bg-surface text-accent shadow-[0_0_0_4px_var(--nr-accent-soft)]",
                    !done && !current && "border-border bg-surface text-ink-faint",
                  )}
                >
                  {done ? <CheckMark className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] tracking-wide sm:block",
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
    </div>
  );
}
