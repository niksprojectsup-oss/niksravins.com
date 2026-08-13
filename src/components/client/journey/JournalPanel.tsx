"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { JOURNAL_PROMPTS } from "@/lib/journey/constants";
import {
  deleteJournalEntryAction,
  saveJournalEntryAction,
} from "@/lib/journey/journey-actions";
import type { JourneyJournalEntry } from "@/lib/journey/journey-repository";
import { cn } from "@/lib/utils";
import { PortalCard } from "./PortalShell";

type JournalPanelProps = {
  entries: JourneyJournalEntry[];
};

const emptyForm = {
  id: undefined as string | undefined,
  content: "",
  prompt: JOURNAL_PROMPTS[0].label as string,
  visibility: "PRIVATE" as "PRIVATE" | "SHARED",
};

export function JournalPanel({ entries }: JournalPanelProps) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(emptyForm);
  }

  function startEdit(entry: JourneyJournalEntry) {
    setForm({
      id: entry.id,
      content: entry.content,
      prompt: entry.prompt,
      visibility: entry.visibility,
    });
  }

  function applyPrompt(label: string) {
    setForm((current) => ({ ...current, prompt: label }));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveJournalEntryAction(form);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Journal entry saved.");
      resetForm();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteJournalEntryAction(id);
    });
  }

  return (
    <div className="layout-stack-lg">
      <PortalCard padding="lg" className="bg-surface/40">
        <h2 className="type-heading-sm">
          {form.id ? "Edit entry" : "What's on your mind today?"}
        </h2>
        <p className="type-body mt-2 text-ink-subtle">
          A private place to notice, reflect, and make sense of what&apos;s happening for you.
        </p>

        {!form.id ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {JOURNAL_PROMPTS.slice(0, 5).map((prompt) => (
              <button
                key={prompt.key}
                type="button"
                onClick={() => applyPrompt(prompt.label)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  form.prompt === prompt.label
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle text-ink-subtle hover:border-accent/40",
                )}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        ) : null}

        <Field label="" id="journalContent" className="mt-6">
          <Textarea
            id="journalContent"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Start anywhere. There is no right way to journal…"
            className="min-h-48 border-border-subtle bg-canvas text-base leading-relaxed"
          />
        </Field>

        <fieldset className="mt-6">
          <legend className="type-label">Who can see this?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-colors",
                form.visibility === "PRIVATE"
                  ? "border-accent bg-accent/5"
                  : "border-border-subtle",
              )}
            >
              <input
                type="radio"
                name="visibility"
                className="sr-only"
                checked={form.visibility === "PRIVATE"}
                onChange={() => setForm({ ...form, visibility: "PRIVATE" })}
              />
              <span className="type-body block text-ink">Private</span>
              <span className="type-caption mt-1 block text-ink-subtle">
                Only you can read this entry.
              </span>
            </label>
            <label
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-colors",
                form.visibility === "SHARED"
                  ? "border-accent bg-accent/5"
                  : "border-border-subtle",
              )}
            >
              <input
                type="radio"
                name="visibility"
                className="sr-only"
                checked={form.visibility === "SHARED"}
                onChange={() => setForm({ ...form, visibility: "SHARED" })}
              />
              <span className="type-body block text-ink">Shared with Niks</span>
              <span className="type-caption mt-1 block text-ink-subtle">
                Niks can read this to support your journey.
              </span>
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : form.id ? "Update entry" : "Save entry"}
          </Button>
          {form.id ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
          {message ? <p className="type-caption text-accent">{message}</p> : null}
        </div>
      </PortalCard>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">Recent entries</h2>
        {entries.length === 0 ? (
          <PortalCard>
            <p className="type-body text-ink">Your journal starts here.</p>
            <p className="type-body mt-2 text-ink-subtle">
              Take a few minutes to notice what&apos;s happening for you today.
            </p>
          </PortalCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map((entry) => (
              <PortalCard key={entry.id}>
                <p className="type-caption text-ink-subtle">
                  {new Date(entry.createdAt).toLocaleString()} ·{" "}
                  {entry.visibility === "PRIVATE" ? "Private" : "Shared with Niks"}
                </p>
                {entry.prompt ? (
                  <p className="type-label mt-2 text-accent">{entry.prompt}</p>
                ) : null}
                <p className="type-body mt-4 line-clamp-6 whitespace-pre-wrap text-ink">
                  {entry.content}
                </p>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    className="type-accent-link text-sm"
                    onClick={() => startEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="type-caption text-ink-subtle hover:text-warm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </PortalCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
