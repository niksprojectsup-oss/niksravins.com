"use client";

import { useState, useTransition } from "react";
import { updateTranslationAction, approveTranslationAction } from "@/lib/admin/actions/identity-test";
import type { IdentityContentEntityType } from "@prisma/client";

type Props = {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
  locale: string;
  label: string;
  draftValue: string;
  publishedValue: string | null;
  translationStatus: string;
  translationId?: string;
  multiline?: boolean;
};

export function TranslationField(props: Props) {
  const [value, setValue] = useState(props.draftValue);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  const dirty = value !== props.draftValue;
  const canApprove = Boolean(props.translationId) && props.translationStatus !== "PUBLISHED" && !dirty && Boolean(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="type-caption font-medium text-ink">
          {props.label} <span className="text-ink-faint">({props.locale})</span>
        </label>
        <span className="type-caption text-ink-faint">{props.translationStatus}</span>
      </div>
      {props.multiline !== false ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
        />
      )}
      {props.publishedValue !== value && props.publishedValue ? (
        <p className="type-caption text-ink-faint">Publicēts: {props.publishedValue.slice(0, 120)}</p>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              await updateTranslationAction({ ...props, draftValue: value });
              setSaved("draft");
            })
          }
          className="type-caption rounded-full border border-border px-3 py-1 text-ink disabled:opacity-40"
        >
          Saglabāt melnrakstu
        </button>
        <button
          type="button"
          disabled={pending || !value}
          onClick={() =>
            start(async () => {
              await updateTranslationAction({ ...props, draftValue: value, publish: true });
              setSaved("published");
            })
          }
          className="type-caption rounded-full bg-accent px-3 py-1 text-surface disabled:opacity-40"
        >
          Publicēt
        </button>
        {canApprove ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await approveTranslationAction(props.translationId!);
                setSaved("approved");
              })
            }
            className="type-caption rounded-full border border-accent px-3 py-1 text-accent"
          >
            Apstiprināt
          </button>
        ) : null}
        {saved ? <span className="type-caption text-ink-faint">✓</span> : null}
      </div>
    </div>
  );
}
