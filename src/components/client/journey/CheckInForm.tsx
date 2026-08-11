"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { CHECK_IN_MOODS, EMOTION_TAGS } from "@/lib/journey/constants";
import { saveCheckInAction } from "@/lib/journey/journey-actions";
import type { JourneyCheckIn } from "@/lib/journey/journey-repository";
import { cn } from "@/lib/utils";

type CheckInFormProps = {
  timezone: string;
  existing: JourneyCheckIn | null;
  compact?: boolean;
};

export function CheckInForm({ timezone, existing, compact }: CheckInFormProps) {
  const [mood, setMood] = useState(existing?.mood ?? "");
  const [emotionTags, setEmotionTags] = useState<string[]>(existing?.emotionTags ?? []);
  const [intensity, setIntensity] = useState(existing?.intensity ?? 5);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tag: string) {
    setEmotionTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveCheckInAction({
        mood,
        emotionTags,
        intensity,
        notes,
        timezone,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(existing ? "Check-in updated." : "Today's check-in saved.");
    });
  }

  if (existing && compact) {
    return (
      <div className="observed-card p-6">
        <p className="type-body text-accent">Today&apos;s check-in completed.</p>
        <p className="type-caption mt-2">
          {CHECK_IN_MOODS.find((m) => m.key === existing.mood)?.label} · intensity{" "}
          {existing.intensity}/10
        </p>
        <a href="/client/check-in" className="type-accent-link mt-4 inline-block">
          Edit check-in
        </a>
      </div>
    );
  }

  return (
    <div className={compact ? "observed-card p-6" : ""}>
      {existing ? (
        <p className="type-body mb-4 text-accent">Today&apos;s check-in completed. You can edit it below.</p>
      ) : (
        <p className="type-body mb-4 text-ink-subtle">
          {compact ? "How are you feeling today?" : "Nothing recorded today. How are you feeling right now?"}
        </p>
      )}

      <h3 className="type-heading-sm">How are you feeling today?</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {CHECK_IN_MOODS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMood(item.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              mood === item.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle text-ink-subtle hover:border-accent/40",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <h3 className="type-heading-sm mt-8">What are you feeling?</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {EMOTION_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              emotionTags.includes(tag)
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle text-ink-subtle hover:border-accent/40",
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <Field label="How strong does it feel?" id="intensity" className="mt-8">
        <div className="flex items-center gap-4">
          <input
            id="intensity"
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <span className="type-body w-8 text-center">{intensity}</span>
        </div>
      </Field>

      <Field label="What's on your mind? (optional)" id="checkInNotes" className="mt-6">
        <Textarea
          id="checkInNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — whatever feels helpful to note…"
        />
      </Field>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending || !mood}>
          {isPending ? "Saving…" : "Save today's check-in"}
        </Button>
        {message ? <p className="type-caption text-accent">{message}</p> : null}
      </div>
    </div>
  );
}
