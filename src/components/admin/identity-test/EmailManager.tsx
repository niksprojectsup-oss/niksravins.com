"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TranslationField } from "./TranslationField";
import { StatusControl } from "./StatusControl";
import { updateEmailTemplateAction, sendTestEmailAction } from "@/lib/admin/actions/identity-test";
import type { IdentityContentStatus, IdentityEmailStep } from "@prisma/client";

type TRow = {
  id?: string;
  entityId: string;
  field: string;
  locale: string;
  draftValue: string;
  publishedValue: string | null;
  translationStatus: string;
};

const STEPS: IdentityEmailStep[] = ["RESULT", "DAY_1", "DAY_3", "DAY_5"];
const LOCALES = ["lv", "en"] as const;

export function EmailManager({
  templates,
  translations,
}: {
  templates: { id: string; step: IdentityEmailStep; delayDays: number; status: string }[];
  translations: TRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [testTo, setTestTo] = useState<Record<string, string>>({});
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});

  const t = (entityId: string, field: string, locale: string): TRow =>
    translations.find((r) => r.entityId === entityId && r.field === field && r.locale === locale) ?? {
      entityId, field, locale, draftValue: "", publishedValue: null, translationStatus: "NOT_TRANSLATED",
    };

  return (
    <div className="layout-stack-lg">
      {STEPS.map((step) => {
        const tpl = templates.find((x) => x.step === step);
        return (
          <section key={step} className="observed-card space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="type-heading-sm">{step}</h3>
              {tpl ? (
                <StatusControl value={tpl.status}
                  onSave={(s: IdentityContentStatus) => updateEmailTemplateAction(step, { status: s })} />
              ) : (
                <button type="button" disabled={pending}
                  onClick={() => start(async () => { await updateEmailTemplateAction(step, {}); router.refresh(); })}
                  className="type-caption rounded-full border border-border px-3 py-1.5 text-ink">
                  + Izveidot veidni
                </button>
              )}
              {step !== "RESULT" && tpl ? (
                <label className="type-caption flex items-center gap-2 text-ink-subtle">
                  Aizture (dienas):
                  <input type="number" defaultValue={tpl.delayDays} min={0}
                    onBlur={(e) => start(async () => { await updateEmailTemplateAction(step, { delayDays: Number(e.target.value) }); router.refresh(); })}
                    className="min-h-10 w-20 rounded-md border border-border bg-surface px-2 text-sm text-ink" />
                </label>
              ) : null}
            </div>
            {tpl ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {LOCALES.flatMap((l) =>
                    (["subject", "body"] as const).map((f) => {
                      const row = t(tpl.id, f, l);
                      return (
                        <TranslationField key={`${f}-${l}`} entityType="EMAIL_TEMPLATE" entityId={tpl.id} field={f} locale={l}
                          label={f === "subject" ? "Tēma" : "Saturs"} draftValue={row.draftValue} publishedValue={row.publishedValue}
                          translationStatus={row.translationStatus} translationId={row.id}
                          multiline={f === "body"} />
                      );
                    }),
                  )}
                </div>
                <form className="flex items-center gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const to = (testTo[step] ?? "").trim();
                    if (!to) return;
                    start(async () => {
                      const r = await sendTestEmailAction({ step, locale: "lv", recipient: to });
                      setTestMsg((p) => ({ ...p, [step]: r.ok ? "Nosūtīts ✓" : `Kļūda: ${r.reason ?? "?"}` }));
                    });
                  }}>
                  <input value={testTo[step] ?? ""} onChange={(e) => setTestTo((p) => ({ ...p, [step]: e.target.value }))}
                    placeholder="Testa e-pasts" type="email"
                    className="min-h-10 w-64 rounded-md border border-border bg-surface px-3 text-sm text-ink" />
                  <button type="submit" disabled={pending} className="type-caption rounded-full border border-border px-3 py-1.5 text-ink">
                    Sūtīt testu
                  </button>
                  {testMsg[step] ? <span className="type-caption text-ink-subtle">{testMsg[step]}</span> : null}
                </form>
              </>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
