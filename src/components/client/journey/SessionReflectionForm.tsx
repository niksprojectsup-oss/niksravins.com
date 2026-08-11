"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { saveSessionReflectionAction } from "@/lib/journey/journey-actions";
import type { JourneySessionReflection } from "@/lib/journey/journey-repository";

type SessionReflectionFormProps = {
  sessionId: string;
  sessionLabel: string;
  existing: JourneySessionReflection | null;
};

export function SessionReflectionForm({
  sessionId,
  sessionLabel,
  existing,
}: SessionReflectionFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [valuablePart, setValuablePart] = useState(existing?.valuablePart ?? "");
  const [whatShifted, setWhatShifted] = useState(existing?.whatShifted ?? "");
  const [takeaway, setTakeaway] = useState(existing?.takeaway ?? "");
  const [messageToPractitioner, setMessageToPractitioner] = useState(
    existing?.messageToPractitioner ?? "",
  );
  const [shared, setShared] = useState(existing?.sharedWithPractitioner ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSessionReflectionAction(sessionId, {
        rating,
        valuablePart,
        whatShifted,
        takeaway,
        messageToPractitioner,
        sharedWithPractitioner: shared,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Reflection saved.");
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Reflect on your session</h2>
      <p className="type-caption mt-2">{sessionLabel}</p>

      <Field label="How was today's session?" id="sessionRating" className="mt-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-10 w-10 rounded-full border text-sm ${
                rating === value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border-subtle text-ink-subtle"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </Field>

      <Field label="What felt most valuable?" id="valuablePart" className="mt-6">
        <Textarea id="valuablePart" value={valuablePart} onChange={(e) => setValuablePart(e.target.value)} />
      </Field>
      <Field label="Did anything shift for you?" id="whatShifted" className="mt-4">
        <Textarea id="whatShifted" value={whatShifted} onChange={(e) => setWhatShifted(e.target.value)} />
      </Field>
      <Field label="What are you taking away from this session?" id="takeaway" className="mt-4">
        <Textarea id="takeaway" value={takeaway} onChange={(e) => setTakeaway(e.target.value)} />
      </Field>
      <Field label="Is there anything you want Niks to know?" id="messageToPractitioner" className="mt-4">
        <Textarea
          id="messageToPractitioner"
          value={messageToPractitioner}
          onChange={(e) => setMessageToPractitioner(e.target.value)}
        />
      </Field>

      <fieldset className="mt-6">
        <legend className="type-body">Would you like to share this reflection with Niks?</legend>
        <div className="mt-3 flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" checked={shared} onChange={() => setShared(true)} />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={!shared} onChange={() => setShared(false)} />
            No
          </label>
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending || rating < 1}>
          {isPending ? "Saving…" : "Save reflection"}
        </Button>
        {message ? <p className="type-caption text-accent">{message}</p> : null}
      </div>
    </section>
  );
}
