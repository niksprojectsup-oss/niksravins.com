"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { saveSessionPreparationAction } from "@/lib/journey/journey-actions";
import type { JourneyNextSession, JourneySessionPreparation } from "@/lib/journey/journey-repository";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";

type NextSessionSectionProps = {
  session: JourneyNextSession;
  preparation: JourneySessionPreparation | null;
  timezone: string;
};

export function NextSessionSection({
  session,
  preparation,
  timezone,
}: NextSessionSectionProps) {
  const [reflection, setReflection] = useState(preparation?.reflection ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveSessionPreparationAction(session.id, reflection);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Reflection saved.");
    });
  }

  return (
    <section id="next-session" className="observed-card p-6 md:p-8">
      <p className="type-label text-accent">Next session</p>
      <h2 className="type-heading-sm mt-2">
        {session.serviceTitle ?? session.sessionType}
      </h2>
      {session.sessionNumber ? (
        <p className="type-caption mt-2">Session {session.sessionNumber}</p>
      ) : null}
      <p className="type-body mt-4 text-ink">
        {formatPortalSessionDateTime(session.scheduledAt, timezone)}
      </p>
      <p className="type-caption mt-1">Your timezone: {timezone}</p>
      {session.meetingLink ? (
        <p className="mt-4">
          <a href={session.meetingLink} className="type-accent-link" target="_blank" rel="noreferrer">
            Join meeting
          </a>
        </p>
      ) : null}

      <div className="mt-8 border-t border-border-subtle pt-8">
        <h3 className="type-heading-sm">Before your next session</h3>
        <p className="type-body mt-2 text-ink-subtle">
          Is there anything you&apos;d like to bring into our next conversation?
        </p>
        <Field label="" id="preSessionReflection" className="mt-4">
          <Textarea
            id="preSessionReflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take a moment to notice what feels alive for you right now…"
          />
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save reflection"}
          </Button>
          {message ? <p className="type-caption text-accent">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
