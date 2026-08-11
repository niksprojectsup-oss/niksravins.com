"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { JOURNAL_PROMPTS } from "@/lib/journey/constants";
import {
  deleteJournalEntryAction,
  saveJournalEntryAction,
} from "@/lib/journey/journey-actions";
import type { JourneyJournalEntry } from "@/lib/journey/journey-repository";

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
      <section className="observed-card p-6 md:p-8">
        <h2 className="type-heading-sm">
          {form.id ? "Edit entry" : "What would you like to reflect on?"}
        </h2>
        <Field label="Prompt" id="journalPrompt" className="mt-6">
          <Select
            id="journalPrompt"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          >
            {JOURNAL_PROMPTS.map((p) => (
              <option key={p.key} value={p.label}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="" id="journalContent" className="mt-4">
          <Textarea
            id="journalContent"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Take a few minutes to notice what's happening for you today…"
          />
        </Field>

        <fieldset className="mt-6">
          <legend className="type-heading-sm">Who can see this?</legend>
          <div className="mt-4 layout-stack-sm">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="visibility"
                checked={form.visibility === "PRIVATE"}
                onChange={() => setForm({ ...form, visibility: "PRIVATE" })}
              />
              <span className="type-body">Private — only me</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="visibility"
                checked={form.visibility === "SHARED"}
                onChange={() => setForm({ ...form, visibility: "SHARED" })}
              />
              <span className="type-body">Share with Niks</span>
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
      </section>

      <section className="layout-stack-md">
        <h2 className="type-heading-sm">Your entries</h2>
        {entries.length === 0 ? (
          <div className="observed-card p-6 md:p-8">
            <p className="type-body text-ink">Your journal starts here.</p>
            <p className="type-body mt-2 text-ink-subtle">
              Take a few minutes to notice what&apos;s happening for you today.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="observed-card p-6 md:p-8">
              <p className="type-caption text-ink-subtle">
                {new Date(entry.createdAt).toLocaleString()} ·{" "}
                {entry.visibility === "PRIVATE" ? "Private" : "Shared with Niks"}
              </p>
              {entry.prompt ? (
                <p className="type-label mt-2 text-accent">{entry.prompt}</p>
              ) : null}
              <p className="type-body mt-4 whitespace-pre-wrap text-ink">{entry.content}</p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="type-accent-link"
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
            </article>
          ))
        )}
      </section>
    </div>
  );
}
