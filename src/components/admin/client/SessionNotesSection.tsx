"use client";

import { useState, useTransition } from "react";
import { addSessionNoteAction } from "@/lib/admin/actions/clients";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { formatAdminDateTime } from "@/lib/admin/mock-data";
import type { ClientSessionNote } from "@/lib/admin/client-types";

const emptyForm = {
  scheduledAt: "",
  sessionType: "Initial AAP Session",
  mainTopic: "",
  notes: "",
  changesNoticed: "",
  nextFocus: "",
};

export function SessionNotesSection({
  clientId,
  sessions,
}: {
  clientId: string;
  sessions: ClientSessionNote[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  function handleSubmit() {
    startTransition(async () => {
      await addSessionNoteAction(clientId, {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      setForm(emptyForm);
      setShowForm(false);
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="layout-stack-sm">
          <h2 className="type-heading-sm">Session notes</h2>
          <p className="type-body">Record of sessions, topics, and observed changes.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? "Cancel" : "Add session"}
        </Button>
      </div>

      {showForm ? (
        <div className="mt-6 layout-stack-md border-t border-border-subtle pt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Date" id="sessionDate">
              <Input
                id="sessionDate"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </Field>
            <Field label="Session type" id="sessionType">
              <Input
                id="sessionType"
                value={form.sessionType}
                onChange={(e) => setForm({ ...form, sessionType: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Main topic" id="mainTopic">
            <Input
              id="mainTopic"
              value={form.mainTopic}
              onChange={(e) => setForm({ ...form, mainTopic: e.target.value })}
            />
          </Field>
          <Field label="Notes" id="notes">
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <Field label="Changes noticed" id="changesNoticed">
            <Textarea
              id="changesNoticed"
              value={form.changesNoticed}
              onChange={(e) => setForm({ ...form, changesNoticed: e.target.value })}
            />
          </Field>
          <Field label="Next focus" id="nextFocus">
            <Textarea
              id="nextFocus"
              value={form.nextFocus}
              onChange={(e) => setForm({ ...form, nextFocus: e.target.value })}
            />
          </Field>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !form.scheduledAt}>
            {isPending ? "Saving…" : "Save session"}
          </Button>
        </div>
      ) : null}

      <ul className="mt-6 layout-stack-md">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <li
              key={session.id}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0"
            >
              <div className="layout-stack-sm">
                <p className="type-body text-ink">
                  {session.sessionType} · {formatAdminDateTime(session.scheduledAt)}
                </p>
                {session.mainTopic ? (
                  <p className="type-caption">Topic: {session.mainTopic}</p>
                ) : null}
                {session.notes ? <p className="type-body">{session.notes}</p> : null}
                {session.changesNoticed ? (
                  <p className="type-body">
                    <span className="text-ink-subtle">Changes: </span>
                    {session.changesNoticed}
                  </p>
                ) : null}
                {session.nextFocus ? (
                  <p className="type-body">
                    <span className="text-ink-subtle">Next focus: </span>
                    {session.nextFocus}
                  </p>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li>
            <p className="type-body">No session notes yet.</p>
          </li>
        )}
      </ul>
    </section>
  );
}
