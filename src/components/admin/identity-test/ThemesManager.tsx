"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TranslationField } from "./TranslationField";
import { StatusControl } from "./StatusControl";
import {
  createThemeAction,
  createSubcategoryAction,
  updateThemeAction,
  updateSubcategoryAction,
} from "@/lib/admin/actions/identity-test";
import type { IdentityContentStatus } from "@prisma/client";

type TRow = {
  id?: string;
  entityId: string;
  field: string;
  locale: string;
  draftValue: string;
  publishedValue: string | null;
  translationStatus: string;
};

type ThemeData = {
  id: string;
  slug: string;
  sortOrder: number;
  status: string;
  isSensitive: boolean;
  subcategories: { id: string; slug: string; status: string; beliefCount: number }[];
};

const FIELDS = [
  { field: "name", label: "Nosaukums", multiline: false },
  { field: "description", label: "Apraksts", multiline: true },
  { field: "safetyNote", label: "Drošības piezīme", multiline: true },
];
const SUB_FIELDS = [
  { field: "name", label: "Nosaukums", multiline: false },
  { field: "description", label: "Apraksts", multiline: true },
];
const LOCALES = ["lv", "en"] as const;

export function ThemesManager({ themes, translations }: { themes: ThemeData[]; translations: TRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newSlug, setNewSlug] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const t = (entityId: string, field: string, locale: string): TRow =>
    translations.find((r) => r.entityId === entityId && r.field === field && r.locale === locale) ?? {
      entityId,
      field,
      locale,
      draftValue: "",
      publishedValue: null,
      translationStatus: "NOT_TRANSLATED",
    };

  return (
    <div className="layout-stack-lg">
      <form
        className="flex items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newSlug.trim()) return;
          start(async () => {
            await createThemeAction({ slug: newSlug.trim() });
            setNewSlug("");
            router.refresh();
          });
        }}
      >
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="Jaunas tēmas slug (piem. t11-jautajums)"
          className="min-h-10 w-72 rounded-md border border-border bg-surface px-3 text-sm text-ink"
        />
        <button type="submit" disabled={pending} className="type-caption rounded-full bg-accent px-4 py-2 text-surface">
          Izveidot tēmu
        </button>
      </form>

      {themes.map((theme) => (
        <section key={theme.id} className="observed-card space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="type-heading-sm">
              {theme.sortOrder + 1}. {theme.slug}
            </h2>
            <StatusControl
              value={theme.status}
              onSave={(s: IdentityContentStatus) => updateThemeAction(theme.id, { status: s })}
            />
            {theme.isSensitive ? (
              <span className="type-caption rounded-full border border-border px-2 py-0.5 text-ink-subtle">
                jūtīga tēma
              </span>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FIELDS.filter((f) => theme.isSensitive || f.field !== "safetyNote").map((f) =>
              LOCALES.map((locale) => {
                const row = t(theme.id, f.field, locale);
                return (
                  <TranslationField
                    key={`${f.field}-${locale}`}
                    entityType="THEME"
                    entityId={theme.id}
                    field={f.field}
                    locale={locale}
                    label={f.label}
                    draftValue={row.draftValue}
                    publishedValue={row.publishedValue}
                    translationStatus={row.translationStatus}
                    translationId={row.id}
                    multiline={f.multiline}
                  />
                );
              }),
            )}
          </div>

          <div className="space-y-3 border-t border-border-subtle pt-4">
            {theme.subcategories.map((sub) => (
              <details key={sub.id} className="rounded-md border border-border-subtle p-3">
                <summary className="flex cursor-pointer items-center justify-between">
                  <span className="type-body">
                    {sub.slug} <span className="type-caption text-ink-faint">({sub.beliefCount} uzskati)</span>
                  </span>
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <StatusControl
                      value={sub.status}
                      onSave={(s: IdentityContentStatus) => updateSubcategoryAction(sub.id, { status: s })}
                    />
                    <Link href={`/admin/identity-test/beliefs?subcategory=${sub.id}`} className="type-caption text-accent">
                      Uzskati →
                    </Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {SUB_FIELDS.map((f) =>
                      LOCALES.map((locale) => {
                        const row = t(sub.id, f.field, locale);
                        return (
                          <TranslationField
                            key={`${f.field}-${locale}`}
                            entityType="SUBCATEGORY"
                            entityId={sub.id}
                            field={f.field}
                            locale={locale}
                            label={f.label}
                            draftValue={row.draftValue}
                            publishedValue={row.publishedValue}
                            translationStatus={row.translationStatus}
                            translationId={row.id}
                            multiline={f.multiline}
                          />
                        );
                      }),
                    )}
                  </div>
                </div>
              </details>
            ))}
            <form
              className="flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const slug = (newSub[theme.id] ?? "").trim();
                if (!slug) return;
                start(async () => {
                  await createSubcategoryAction(theme.id, { slug });
                  setNewSub((p) => ({ ...p, [theme.id]: "" }));
                  router.refresh();
                });
              }}
            >
              <input
                value={newSub[theme.id] ?? ""}
                onChange={(e) => setNewSub((p) => ({ ...p, [theme.id]: e.target.value }))}
                placeholder="Jaunas apakštēmas slug"
                className="min-h-10 w-64 rounded-md border border-border bg-surface px-3 text-sm text-ink"
              />
              <button type="submit" disabled={pending} className="type-caption rounded-full border border-border px-3 py-1.5 text-ink">
                + Apakštēma
              </button>
            </form>
          </div>
        </section>
      ))}
    </div>
  );
}
