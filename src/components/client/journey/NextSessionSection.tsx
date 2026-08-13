"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { saveSessionPreparationAction } from "@/lib/journey/journey-actions";
import type { JourneyNextSession, JourneySessionPreparation } from "@/lib/journey/journey-repository";
import { formatPortalSessionDateTime } from "@/lib/client/portal-repository";
import { PortalCard } from "./PortalShell";

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
    <PortalCard id="next-session" padding="lg" className="h-full">
      <p className="type-label text-accent">Next session</p>
      <h2 className="type-heading-sm mt-2">
        {session.serviceTitle ?? session.sessionType}
      </h2>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {session.sessionNumber ? (
          <div>
            <dt className="type-caption">Session</dt>
            <dd className="type-body mt-1">Session {session.sessionNumber}</dd>
          </div>
        ) : null}
        <div>
          <dt className="type-caption">When</dt>
          <dd className="type-body mt-1">
            {formatPortalSessionDateTime(session.scheduledAt, timezone)}
          </dd>
        </div>
        <div>
          <dt className="type-caption">Duration</dt>
          <dd className="type-body mt-1">45 minutes</dd>
        </div>
        <div>
          <dt className="type-caption">Format</dt>
          <dd className="type-body mt-1">Online · {timezone}</dd>
        </div>
      </dl>

      {session.meetingLink ? (
        <p className="mt-5">
          <a href={session.meetingLink} className="type-accent-link" target="_blank" rel="noreferrer">
            Join meeting
          </a>
        </p>
      ) : (
        <p className="type-caption mt-5 text-ink-subtle">
          Meeting link will be shared before your session.
        </p>
      )}

      <div className="mt-8 border-t border-border-subtle pt-6">
        <h3 className="type-heading-sm">Prepare for this session</h3>
        <p className="type-body mt-2 text-ink-subtle">
          Is there anything you&apos;d like to bring into our next conversation?
        </p>
        <Field label="" id="preSessionReflection" className="mt-4">
          <Textarea
            id="preSessionReflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take a moment to notice what feels alive for you right now…"
            className="min-h-28"
          />
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save reflection"}
          </Button>
          {message ? <p className="type-caption text-accent">{message}</p> : null}
        </div>
      </div>
    </PortalCard>
  );
}
