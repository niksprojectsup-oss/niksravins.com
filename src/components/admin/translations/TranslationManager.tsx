"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addTranslationItemAction,
  publishTranslationsAction,
  saveTranslationDraftsAction,
} from "@/lib/admin/actions/translations";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { cmsEditorPathForKey, isCmsOwnedCatalogKey } from "@/lib/cms/field-ownership";
import {
  ADDABLE_LIST_FIELDS,
  ADDABLE_LISTS,
} from "@/lib/i18n/translation-catalog";
import {
  TRANSLATION_LOCALE_LABELS,
  TRANSLATION_PAGES,
  type TranslationLocale,
} from "@/lib/i18n/translation-locales";
import type { TranslationRow } from "@/lib/i18n/translation-repository";

type StatusFilter = "all" | "missing" | "untranslated" | "unpublished" | "cms";

type TranslationManagerProps = {
  locale: TranslationLocale;
  locales: TranslationLocale[];
  rows: TranslationRow[];
};

export function TranslationManager({
  locale,
  locales,
  rows,
}: TranslationManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("all");
  const [section, setSection] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const catalogAddableLists = ADDABLE_LISTS.filter((item) => !isCmsOwnedCatalogKey(item));
  const [addPrefix, setAddPrefix] = useState<(typeof ADDABLE_LISTS)[number]>(
    catalogAddableLists[0] ?? "testimonials.items",
  );
  const [addFields, setAddFields] = useState<Record<string, string>>({});

  const sections = useMemo(() => {
    const unique = new Set(rows.filter((row) => page === "all" || row.page === page).map((row) => row.section));
    return [...unique].sort();
  }, [rows, page]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (page !== "all" && row.page !== page) return false;
      if (section !== "all" && row.section !== section) return false;
      const cmsOwned = isCmsOwnedCatalogKey(row.key);
      if (status === "cms") {
        if (!cmsOwned) return false;
      } else if (cmsOwned) {
        return false;
      }
      if (status === "missing" && !row.missing) return false;
      if (status === "untranslated" && !row.untranslated) return false;
      if (status === "unpublished" && !row.unpublished && drafts[row.key] === undefined) return false;
      if (!query) return true;
      return (
        row.key.toLowerCase().includes(query) ||
        row.englishSource.toLowerCase().includes(query) ||
        (drafts[row.key] ?? row.draftValue).toLowerCase().includes(query)
      );
    });
  }, [rows, page, section, status, search, drafts]);

  const dirtyCount = Object.keys(drafts).length;
  const missingCount = rows.filter((row) => row.missing).length;
  const untranslatedCount = rows.filter((row) => row.untranslated).length;
  const unpublishedCount = rows.filter((row) => row.unpublished).length;

  function currentValue(row: TranslationRow): string {
    return drafts[row.key] ?? row.draftValue;
  }

  function saveDrafts() {
    const payload = Object.entries(drafts).map(([key, value]) => ({ key, value }));
    if (payload.length === 0) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveTranslationDraftsAction({ locale, drafts: payload });
        setDrafts({});
        setNotice("Drafts saved.");
        router.refresh();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Could not save drafts.");
      }
    });
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      try {
        if (dirtyCount > 0) {
          await saveTranslationDraftsAction({
            locale,
            drafts: Object.entries(drafts).map(([key, value]) => ({ key, value })),
          });
          setDrafts({});
        }
        const result = await publishTranslationsAction({ locale });
        setNotice(`Published ${result.published} translation${result.published === 1 ? "" : "s"}.`);
        router.refresh();
      } catch (publishError) {
        setError(publishError instanceof Error ? publishError.message : "Could not publish.");
      }
    });
  }

  function addItem() {
    setError(null);
    startTransition(async () => {
      try {
        await addTranslationItemAction({ prefix: addPrefix, fields: addFields });
        setAddFields({});
        setNotice("New item added as an English draft. Translate and publish when ready.");
        router.refresh();
      } catch (addError) {
        setError(addError instanceof Error ? addError.message : "Could not add item.");
      }
    });
  }

  return (
    <div className="layout-stack-lg">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <label className="layout-stack-sm">
            <span className="type-caption">Locale</span>
            <select
              className="min-h-11 rounded-md border border-border-subtle bg-surface px-3"
              value={locale}
              onChange={(event) => router.push(`/admin/translations?locale=${event.target.value}`)}
            >
              {locales.map((item) => (
                <option key={item} value={item}>
                  {TRANSLATION_LOCALE_LABELS[item]} ({item})
                </option>
              ))}
            </select>
          </label>
          <label className="layout-stack-sm">
            <span className="type-caption">Page</span>
            <select
              className="min-h-11 rounded-md border border-border-subtle bg-surface px-3"
              value={page}
              onChange={(event) => {
                setPage(event.target.value);
                setSection("all");
              }}
            >
              <option value="all">All pages</option>
              {TRANSLATION_PAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="layout-stack-sm">
            <span className="type-caption">Section</span>
            <select
              className="min-h-11 rounded-md border border-border-subtle bg-surface px-3"
              value={section}
              onChange={(event) => setSection(event.target.value)}
            >
              <option value="all">All sections</option>
              {sections.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="layout-stack-sm">
            <span className="type-caption">Status</span>
            <select
              className="min-h-11 rounded-md border border-border-subtle bg-surface px-3"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="all">All</option>
              <option value="missing">Missing</option>
              <option value="untranslated">English fallbacks</option>
              <option value="unpublished">Unpublished drafts</option>
              <option value="cms">CMS-owned (read-only)</option>
            </select>
          </label>
          <label className="layout-stack-sm min-w-56 flex-1">
            <span className="type-caption">Search</span>
            <input
              className="min-h-11 w-full rounded-md border border-border-subtle bg-surface px-3"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Key, English, or translation"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={isPending || dirtyCount === 0} onClick={saveDrafts}>
            Save drafts
          </Button>
          <Button type="button" disabled={isPending} onClick={publish}>
            Publish {TRANSLATION_LOCALE_LABELS[locale]}
          </Button>
        </div>
      </div>

      <p className="type-caption text-ink-subtle">
        {visibleRows.length} shown · {missingCount} missing · {untranslatedCount} English fallbacks · {unpublishedCount} unpublished · {dirtyCount} unsaved
      </p>
      <p className="type-caption text-ink-subtle">
        Homepage and legal body fields are edited in{" "}
        <Link href="/admin/content/home" className="text-accent no-underline hover:text-accent-strong">
          Content → Homepage
        </Link>
        {" · "}
        <Link href="/admin/content/legal" className="text-accent no-underline hover:text-accent-strong">
          Content → Legal
        </Link>
        . They are hidden here unless you filter “CMS-owned”.
      </p>
      {notice ? <p className="type-caption text-accent">{notice}</p> : null}
      {error ? <p className="type-caption text-warm">{error}</p> : null}

      <section className="observed-card layout-stack-md p-5">
        <h2 className="type-heading-sm">Add content in an existing section</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="layout-stack-sm">
            <span className="type-caption">Section</span>
            <select
              className="min-h-11 rounded-md border border-border-subtle bg-surface px-3"
              value={addPrefix}
              onChange={(event) => {
                setAddPrefix(event.target.value as (typeof ADDABLE_LISTS)[number]);
                setAddFields({});
              }}
            >
              {catalogAddableLists.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {(ADDABLE_LIST_FIELDS[addPrefix].length === 0 ? ["value"] : ADDABLE_LIST_FIELDS[addPrefix]).map((field) => (
            <label key={field} className="layout-stack-sm min-w-56 flex-1">
              <span className="type-caption">English {field}</span>
              <input
                className="min-h-11 w-full rounded-md border border-border-subtle bg-surface px-3"
                value={addFields[field] ?? ""}
                onChange={(event) =>
                  setAddFields((current) => ({ ...current, [field]: event.target.value }))
                }
              />
            </label>
          ))}
          <Button type="button" variant="secondary" disabled={isPending} onClick={addItem}>
            Add item
          </Button>
        </div>
      </section>

      <div className="layout-stack-md">
        {visibleRows.map((row) => (
          <article key={row.id} className="observed-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="type-caption text-ink-subtle">
                  {row.page} / {row.section}
                </p>
                <p className="font-medium text-ink">{row.key}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isCmsOwnedCatalogKey(row.key) ? (
                  <AdminStatusBadge label="CMS — edit in Content" variant="muted" />
                ) : null}
                {row.missing ? <AdminStatusBadge label="Missing" variant="warm" /> : null}
                {row.untranslated ? <AdminStatusBadge label="English fallback" variant="muted" /> : null}
                {!isCmsOwnedCatalogKey(row.key) && (row.unpublished || drafts[row.key] !== undefined) ? (
                  <AdminStatusBadge label="Draft" variant="default" />
                ) : null}
                {!isCmsOwnedCatalogKey(row.key) && !row.unpublished && drafts[row.key] === undefined ? (
                  <AdminStatusBadge label="Published" variant="accent" />
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="layout-stack-sm">
                <span className="type-caption">English source</span>
                <textarea
                  readOnly
                  className="min-h-28 w-full rounded-md border border-border-subtle bg-canvas px-3 py-2 text-ink-subtle"
                  value={row.englishSource}
                />
              </label>
              <label className="layout-stack-sm">
                <span className="type-caption">{TRANSLATION_LOCALE_LABELS[locale]} translation</span>
                <textarea
                  readOnly={isCmsOwnedCatalogKey(row.key)}
                  className="min-h-28 w-full rounded-md border border-border-subtle bg-surface px-3 py-2"
                  value={currentValue(row)}
                  onChange={(event) => {
                    if (isCmsOwnedCatalogKey(row.key)) return;
                    setDrafts((current) => ({ ...current, [row.key]: event.target.value }));
                  }}
                />
                {isCmsOwnedCatalogKey(row.key) ? (
                  <Link
                    href={cmsEditorPathForKey(row.key)}
                    className="type-caption text-accent no-underline hover:text-accent-strong"
                  >
                    Open in Content
                  </Link>
                ) : null}
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
