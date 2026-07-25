"use client";

import { useState, useTransition } from "react";
import { savePractitionerNotesAction } from "@/app/admin/clients/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";

export function PractitionerNotesSection({
  clientId,
  initialNotes,
}: {
  clientId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await savePractitionerNotesAction(clientId, notes);
      setSaved(true);
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <div className="layout-stack-sm">
        <h2 className="type-heading-sm">Practitioner notes</h2>
        <p className="type-body">Private notes — not visible to clients.</p>
      </div>

      <div className="mt-6">
        <Field label="Notes" id="practitionerNotes">
          <Textarea
            id="practitionerNotes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
            rows={6}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save notes"}
        </Button>
        {saved ? <p className="type-caption text-accent">Saved</p> : null}
      </div>
    </section>
  );
}
