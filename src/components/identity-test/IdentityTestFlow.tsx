"use client";

import { useMemo, useState } from "react";
import type { IdentityTestContent } from "@/content/i18n/types";
import type { TestContentTree } from "@/lib/identity-test/types";
import { cn } from "@/lib/utils";

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
  const selectedBeliefs = useMemo(
    () => tree.beliefs.filter((b) => beliefIds.has(b.id)),
    [tree.beliefs, beliefIds],
  );
  const crisisSelected = selectedBeliefs.some((b) => b.safetyFlags.includes("CRISIS"));

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

  const checkboxClass =
    "mt-1 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-border-strong bg-surface transition-colors checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="mx-auto max-w-prose">
      {/* Progress */}
      {step !== "intro" ? (
        <ol className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="progress">
          {ui.steps.map((label, index) => (
            <li
              key={label}
              className={cn(
                "type-caption",
                index <= stepIndex ? "text-ink" : "text-ink-faint",
              )}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              {index > 0 ? "— " : ""}
              {label}
            </li>
          ))}
        </ol>
      ) : null}

      {step === "intro" ? (
        <section className="layout-stack-md">
          <h1 className="font-display text-4xl tracking-tight text-ink md:text-display">
            {ui.intro.title}
          </h1>
          <p className="type-body text-ink-muted">{ui.intro.subtitle}</p>
          <p className="type-body max-w-prose">{ui.intro.lead}</p>
          <p className="type-caption text-ink-subtle">{ui.intro.note}</p>
          <div>
            <button
              type="button"
              onClick={() => setStep("themes")}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong"
            >
              {ui.intro.startCta}
            </button>
          </div>
        </section>
      ) : null}

      {step === "themes" ? (
        <section className="layout-stack-md">
          <h1 className="type-heading-sm font-display">{ui.themeStep.heading}</h1>
          <ul className="grid gap-3 sm:grid-cols-2">
            {tree.themes.map((theme) => {
              const active = themeIds.has(theme.id);
              return (
                <li key={theme.id}>
                  <label
                    className={cn(
                      "observed-card flex cursor-pointer items-start gap-3 p-5 transition-colors",
                      active && "border-accent",
                    )}
                  >
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      checked={active}
                      onChange={() => toggle(themeIds, theme.id, setThemeIds)}
                    />
                    <span className="type-body">{theme.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <label className="flex w-fit cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              checked={themeIds.size === tree.themes.length}
              onChange={(event) =>
                setThemeIds(
                  event.target.checked
                    ? new Set(tree.themes.map((t) => t.id))
                    : new Set(),
                )
              }
            />
            <span className="type-caption font-medium text-accent">{ui.themeStep.allThemes}</span>
          </label>
          <div className="flex items-center gap-4 pt-4">
            <button type="button" onClick={() => setStep("intro")} className="type-caption text-ink-subtle hover:text-ink">
              {ui.themeStep.back}
            </button>
            <button
              type="button"
              disabled={themeIds.size === 0}
              onClick={() => setStep("beliefs")}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong disabled:opacity-40"
            >
              {ui.themeStep.next}
            </button>
          </div>
        </section>
      ) : null}

      {step === "beliefs" ? (
        <section className="layout-stack-lg">
          <p className="type-caption text-ink-subtle" aria-live="polite">
            {beliefIds.size} {ui.beliefStep.selectedSuffix}
          </p>
          {visibleSubcategories.map((sub) => {
            const beliefs = tree.beliefs.filter((b) => b.subcategoryId === sub.id);
            if (beliefs.length === 0) return null;
            return (
              <fieldset key={sub.id} className="layout-stack-sm">
                <legend className="type-caption mb-3 font-medium uppercase tracking-wide text-ink-subtle">
                  {sub.name}
                </legend>
                <ul className="layout-stack-sm">
                  {beliefs.map((belief) => (
                    <li key={belief.id}>
                      <label className="observed-card flex cursor-pointer items-start gap-3 p-4 transition-colors hover:border-border-strong">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={beliefIds.has(belief.id)}
                          onChange={() => toggle(beliefIds, belief.id, setBeliefIds)}
                        />
                        <span className="type-body">{belief.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            );
          })}
          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={() => setStep("themes")} className="type-caption text-ink-subtle hover:text-ink">
              {ui.beliefStep.back}
            </button>
            <button
              type="button"
              disabled={beliefIds.size === 0}
              onClick={() => setStep("review")}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong disabled:opacity-40"
            >
              {ui.beliefStep.next}
            </button>
          </div>
        </section>
      ) : null}

      {step === "review" ? (
        <section className="layout-stack-md">
          <h1 className="type-heading-sm font-display">{ui.review.heading}</h1>
          <p className="type-caption text-ink-subtle">{ui.review.subheading}</p>
          <ul className="layout-stack-sm">
            {selectedBeliefs.map((belief) => (
              <li key={belief.id} className="observed-card flex items-start justify-between gap-4 p-4">
                <span className="type-body">{belief.text}</span>
                <button
                  type="button"
                  aria-label="×"
                  onClick={() => toggle(beliefIds, belief.id, setBeliefIds)}
                  className="type-caption shrink-0 text-ink-faint hover:text-ink"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {crisisSelected ? <CrisisBlock ui={ui} /> : null}
          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={() => setStep("beliefs")} className="type-caption text-ink-subtle hover:text-ink">
              {ui.review.back}
            </button>
            <button
              type="button"
              disabled={beliefIds.size === 0}
              onClick={() => setStep("email")}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong disabled:opacity-40"
            >
              {ui.review.submitCta}
            </button>
          </div>
        </section>
      ) : null}

      {step === "email" ? (
        <section className="layout-stack-md">
          <h1 className="type-heading-sm font-display">{ui.emailStep.heading}</h1>
          <div className="layout-stack-sm">
            <p className="type-body">{ui.emailStep.lead}</p>
            <p className="type-body text-ink-muted">{ui.emailStep.lead1}</p>
            <p className="type-body text-ink-muted">{ui.emailStep.lead2}</p>
            <p className="type-caption text-ink-subtle">{ui.emailStep.privacyNote}</p>
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
              className="min-h-11 w-full rounded-md border border-border bg-surface px-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          {consentLabel ? (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
              />
              <span className="type-caption text-ink-muted">{consentLabel}</span>
            </label>
          ) : null}

          {crisisSelected ? <CrisisBlock ui={ui} /> : null}
          {error ? (
            <p role="alert" className="type-caption text-red-700">{error}</p>
          ) : null}

          <div className="flex items-center gap-4 pt-2">
            <button type="button" onClick={() => setStep("review")} className="type-caption text-ink-subtle hover:text-ink">
              {ui.review.back}
            </button>
            <button
              type="button"
              disabled={submitting || !email}
              onClick={submit}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-7 text-sm font-medium text-surface transition-colors hover:bg-accent-strong disabled:opacity-40"
            >
              {submitting ? ui.emailStep.sendingLabel : ui.emailStep.submitCta}
            </button>
            {error ? (
              <button type="button" onClick={submit} className="type-caption text-accent hover:text-accent-strong">
                {ui.errors.retry}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className="layout-stack-md">
          <h1 className="type-heading-sm font-display">{ui.confirmation.heading}</h1>
          <p className="type-body">{ui.confirmation.body}</p>
          <p className="type-caption text-ink-subtle">{ui.confirmation.spamNote}</p>
          {crisisSelected ? <CrisisBlock ui={ui} /> : null}
          <div className="layout-stack-sm pt-4">
            <p className="type-body max-w-prose">{ui.confirmation.sessionLead}</p>
            <a
              href={bookingUrl}
              className="inline-flex min-h-11 w-fit items-center rounded-full bg-booking px-7 text-sm font-medium text-surface transition-colors hover:bg-booking-strong"
            >
              {ui.confirmation.sessionCta}
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CrisisBlock({ ui }: { ui: IdentityTestContent }) {
  return (
    <div className="rounded-lg border-l-2 border-warm bg-warm-soft p-5">
      <p className="type-caption font-medium text-ink">{ui.crisis.heading}</p>
      <p className="type-caption mt-2 text-ink-muted">{ui.crisis.body}</p>
    </div>
  );
}
