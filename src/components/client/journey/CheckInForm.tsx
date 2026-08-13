"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  inline?: boolean;
};

export function CheckInForm({ timezone, existing, compact, inline }: CheckInFormProps) {
  const [mood, setMood] = useState(existing?.mood ?? "");
  const [emotionTags, setEmotionTags] = useState<string[]>(existing?.emotionTags ?? []);
  const [intensity, setIntensity] = useState(existing?.intensity ?? 5);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [expanded, setExpanded] = useState(!compact);
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

  if (existing && compact && !expanded) {
    const moodMeta = CHECK_IN_MOODS.find((m) => m.key === existing.mood);
    return (
      <div className="layout-stack-sm">
        <p className="type-body text-accent">
          {moodMeta?.emoji} Today&apos;s check-in completed
        </p>
        <p className="type-caption">
          {moodMeta?.label}
          {existing.emotionTags.length > 0 ? ` · ${existing.emotionTags.join(", ")}` : ""}
        </p>
        <button
          type="button"
          className="type-accent-link self-start text-sm"
          onClick={() => setExpanded(true)}
        >
          Edit check-in
        </button>
      </div>
    );
  }

  return (
    <div className={cn(!inline && compact && "observed-card p-6")}>
      {!compact ? (
        <p className="type-body mb-4 text-ink-subtle">
          {existing
            ? "Today's check-in completed. You can edit it below."
            : "Nothing recorded today. How are you feeling right now?"}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CHECK_IN_MOODS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMood(item.key)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left transition-colors",
              mood === item.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle text-ink-subtle hover:border-accent/40",
            )}
          >
            <span className="text-lg" aria-hidden>
              {item.emoji}
            </span>
            <span className="mt-1 block text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {(expanded || !compact) && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
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

          {!inline ? (
            <Field label="How strong does it feel?" id="intensity" className="mt-6">
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
          ) : null}

          {!inline ? (
            <Field label="What's on your mind? (optional)" id="checkInNotes" className="mt-4">
              <Textarea
                id="checkInNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional — whatever feels helpful to note…"
              />
            </Field>
          ) : null}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={isPending || !mood}>
          {isPending ? "Saving…" : "Save today's check-in"}
        </Button>
        {compact && !existing ? (
          <Link href="/client/check-in" className="type-accent-link text-sm">
            More options
          </Link>
        ) : null}
        {message ? <p className="type-caption text-accent">{message}</p> : null}
      </div>
    </div>
  );
}
