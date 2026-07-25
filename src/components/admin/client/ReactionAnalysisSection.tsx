"use client";

import { useState, useTransition } from "react";
import { saveReactionAnalysisAction } from "@/app/admin/clients/[id]/actions";
import { Field, Textarea } from "@/components/ui/Field";
import { REACTION_ANALYSIS_FIELDS } from "@/lib/admin/client-constants";
import type { ClientWorkspace, ReactionAnalysisInput } from "@/lib/admin/client-types";
import { Button } from "@/components/ui/Button";

export function ReactionAnalysisSection({
  clientId,
  initialData,
}: {
  clientId: string;
  initialData: ClientWorkspace["reactionAnalysis"];
}) {
  const [data, setData] = useState<ReactionAnalysisInput>(initialData);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateField(key: keyof ReactionAnalysisInput, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveReactionAnalysisAction(clientId, data);
      setSaved(true);
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <div className="layout-stack-sm">
        <h2 className="type-heading-sm">Reaction analysis</h2>
        <p className="type-body">
          Structured map of the pattern maintaining the client&apos;s automatic reaction.
        </p>
      </div>

      <div className="mt-6 layout-stack-md">
        {REACTION_ANALYSIS_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} id={field.key}>
            <Textarea
              id={field.key}
              value={data[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={3}
            />
          </Field>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save analysis"}
        </Button>
        {saved ? <p className="type-caption text-accent">Saved</p> : null}
      </div>
    </section>
  );
}
