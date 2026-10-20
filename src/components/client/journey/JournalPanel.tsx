"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JournalCategory } from "@prisma/client";
import type { PortalContent } from "@/content/i18n/portal";
import { portalIntlLocale } from "@/content/i18n/portal";
import type { Locale } from "@/lib/i18n/config";
import {
  deleteJournalEntryAction,
  saveJournalEntryAction,
} from "@/lib/journey/journey-actions";
import type { JourneyJournalEntry } from "@/lib/journey/journey-repository";
import { PortalIcon, PortalIconBadge, type PortalIconName } from "@/components/client/portal/PortalIcon";
import { cn } from "@/lib/utils";

type JournalPanelProps = {
  entries: JourneyJournalEntry[];
  copy: PortalContent["insights"];
  locale: Locale;
  initialQuery?: string;
  heading?: boolean;
};

const CATEGORIES = ["PATTERN", "TRIGGER", "POSITIVE_OBSERVATION"] as const;

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function insightIcon(category: JournalCategory | null): PortalIconName {
  if (category === "PATTERN") return "brain";
  if (category === "TRIGGER") return "heartPulse";
  if (category === "POSITIVE_OBSERVATION") return "sprout";
  return "notebook";
}

function formatInsightDate(entry: JourneyJournalEntry, locale: Locale): string {
  const source = entry.observedOn ?? entry.createdAt.slice(0, 10);
  const [year, month, day] = source.split("-").map(Number);
  if (!year || !month || !day) return source;
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function JournalPanel({
  entries,
  copy,
  locale,
  initialQuery = "",
  heading = true,
}: JournalPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<"ALL" | JournalCategory>("ALL");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    content: "",
    category: "PATTERN" as JournalCategory,
    observedOn: todayKey(),
    visibility: "PRIVATE" as "PRIVATE" | "SHARED",
  });

  const categoryLabel = (category: JournalCategory | null) => {
    if (category === "PATTERN") return copy.pattern;
    if (category === "TRIGGER") return copy.trigger;
    if (category === "POSITIVE_OBSERVATION") return copy.positive;
    return copy.uncategorized;
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter !== "ALL" && entry.category !== filter) return false;
      if (!needle) return true;
      return entry.content.toLowerCase().includes(needle);
    });
  }, [entries, filter, query]);

  function startEdit(entry: JourneyJournalEntry) {
    setPendingDelete(null);
    setForm({
      id: entry.id,
      content: entry.content,
      category: entry.category ?? "PATTERN",
      observedOn: entry.observedOn ?? entry.createdAt.slice(0, 10),
      visibility: entry.visibility,
    });
  }

  function resetForm() {
    setForm({
      id: undefined,
      content: "",
      category: "PATTERN",
      observedOn: todayKey(),
      visibility: "PRIVATE",
    });
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveJournalEntryAction({
        id: form.id,
        content: form.content,
        prompt: "",
        visibility: form.visibility,
        category: form.category,
        observedOn: form.observedOn,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(copy.saved);
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteJournalEntryAction(id);
      if (!result.error) {
        setPendingDelete(null);
        if (form.id === id) resetForm();
        router.refresh();
      }
    });
  }

  const filters = [
    ["ALL", copy.all, "layers"],
    ["PATTERN", copy.pattern, "brain"],
    ["TRIGGER", copy.trigger, "heartPulse"],
    ["POSITIVE_OBSERVATION", copy.positive, "sprout"],
  ] as const;

  return (
    <section id="insights" className="layout-stack-md">
      {heading ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <PortalIconBadge name="notebook" tone="sand" />
            <div>
              <h2 className="portal-section-title text-[#2c2824]">{copy.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-[#6d675f]">{copy.subtitle}</p>
            </div>
          </div>
          <a href="#insight-composer" className="inline-flex h-10 items-center rounded-full bg-[#3f6b4e] px-4 text-sm text-white no-underline">
            {copy.add}
          </a>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label={copy.categoryLabel}>
          {filters.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                filter === key
                  ? "border-[#3f6b4e] bg-[#e7f0ea] text-[#2f5a40]"
                  : "border-[#e4d8c8] text-[#6d675f]",
              )}
            >
              <PortalIcon name={icon} className="h-3.5 w-3.5" />
              {label}
              {key !== "ALL"
                ? ` (${entries.filter((entry) => entry.category === key).length})`
                : ` (${entries.length})`}
            </button>
          ))}
        </div>
        <label className="relative block">
          <span className="sr-only">{copy.searchPlaceholder}</span>
          <PortalIcon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8a7568]"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-10 w-full rounded-full border border-[#e4d8c8] bg-white pr-3 pl-9 text-sm md:w-64"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-[#eadfd2] bg-white/70 p-5 text-[#6d675f]">
          {entries.length === 0 ? copy.empty : copy.noMatches}
        </p>
      ) : (
        <ul className="layout-stack-sm">
          {visible.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-[#eadfd2] bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-1.5 text-sm text-[#6d675f]">
                  <PortalIcon name={insightIcon(entry.category)} className="h-3.5 w-3.5 text-[#3f6b4e]" />
                  {formatInsightDate(entry, locale)} · {categoryLabel(entry.category)}
                </p>
                <div className="flex gap-3 text-sm">
                  <button type="button" className="text-[#3f6b4e]" onClick={() => startEdit(entry)}>
                    {copy.edit}
                  </button>
                  <button type="button" className="text-[#8a5a42]" onClick={() => setPendingDelete(entry.id)}>
                    {copy.delete}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[#2c2824]">{entry.content}</p>
              {pendingDelete === entry.id ? (
                <div className="mt-4 rounded-xl border border-[#eadfd2] bg-[#f7f1e8] p-4" role="alertdialog" aria-labelledby={`delete-${entry.id}`}>
                  <p id={`delete-${entry.id}`} className="font-medium text-[#2c2824]">
                    {copy.confirmTitle}
                  </p>
                  <p className="mt-1 text-sm text-[#6d675f]">{copy.confirmBody}</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-[#8a5a42] px-4 py-2 text-sm text-white"
                      onClick={() => handleDelete(entry.id)}
                      disabled={isPending}
                    >
                      {copy.delete}
                    </button>
                    <button type="button" className="text-sm text-[#6d675f]" onClick={() => setPendingDelete(null)}>
                      {copy.cancel}
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form
        id="insight-composer"
        className="rounded-2xl border border-[#eadfd2] bg-white p-4 md:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <h3 className="portal-section-title flex items-center gap-2 text-[#2c2824]">
          <PortalIconBadge name="notebookPen" tone="ivory" className="h-8 w-8" />
          {form.id ? copy.edit : copy.add}
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-[#5c564e]">
            {copy.dateLabel}
            <input
              type="date"
              required
              value={form.observedOn}
              onChange={(event) => setForm({ ...form, observedOn: event.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-[#e4d8c8] px-3"
            />
          </label>
          <label className="block text-sm text-[#5c564e]">
            {copy.categoryLabel}
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value as JournalCategory })}
              className="mt-1 h-11 w-full rounded-xl border border-[#e4d8c8] px-3"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm text-[#5c564e]">
          {copy.contentLabel}
          <textarea
            required
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            className="mt-1 min-h-24 w-full rounded-xl border border-[#e4d8c8] px-3 py-2 text-sm"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm text-[#5c564e]">{copy.visibilityLegend}</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className={cn("rounded-xl border p-3", form.visibility === "PRIVATE" ? "border-[#3f6b4e] bg-[#f3f8f4]" : "border-[#e4d8c8]")}>
              <input
                type="radio"
                name="visibility"
                className="sr-only"
                checked={form.visibility === "PRIVATE"}
                onChange={() => setForm({ ...form, visibility: "PRIVATE" })}
              />
              <span className="block text-[#2c2824]">{copy.privateTitle}</span>
              <span className="mt-1 block text-sm text-[#6d675f]">{copy.privateHint}</span>
            </label>
            <label className={cn("rounded-xl border p-3", form.visibility === "SHARED" ? "border-[#3f6b4e] bg-[#f3f8f4]" : "border-[#e4d8c8]")}>
              <input
                type="radio"
                name="visibility"
                className="sr-only"
                checked={form.visibility === "SHARED"}
                onChange={() => setForm({ ...form, visibility: "SHARED" })}
              />
              <span className="block text-[#2c2824]">{copy.sharedTitle}</span>
              <span className="mt-1 block text-sm text-[#6d675f]">{copy.sharedHint}</span>
            </label>
          </div>
        </fieldset>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={isPending} className="rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white">
            {isPending ? copy.saving : copy.save}
          </button>
          {form.id ? (
            <button type="button" className="text-sm text-[#6d675f]" onClick={resetForm}>
              {copy.cancel}
            </button>
          ) : null}
          {message ? <p className="text-sm text-[#3f6b4e]">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
