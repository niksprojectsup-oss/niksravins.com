"use client";

import { useActionState, useEffect } from "react";
import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import {
  submitPackageFollowUpAction,
  type PackageFollowUpFormState,
} from "@/lib/booking/actions";
import type { ClientDetails } from "@/lib/booking/types";
import { BookingPanel } from "./BookingPanel";

type PackageFollowUpFormProps = {
  slotId: string;
  scheduledAt: string;
  client: ClientDetails;
  completedSessions: number;
  remainingSessions: number;
  totalSessions: number;
  nextSessionNumber: number;
  onSuccess: () => void;
};

export function PackageFollowUpForm({
  slotId,
  scheduledAt,
  client,
  completedSessions,
  remainingSessions,
  totalSessions,
  nextSessionNumber,
  onSuccess,
}: PackageFollowUpFormProps) {
  const [state, formAction, pending] = useActionState<
    PackageFollowUpFormState,
    FormData
  >(submitPackageFollowUpAction, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <BookingPanel
      title="Confirm your next package session"
      description={`Session ${nextSessionNumber} of ${totalSessions}. No additional payment is required.`}
    >
      <form action={formAction} className="layout-stack-md max-w-prose">
        <p className="type-body text-ink-muted">
          Completed: {completedSessions} · Remaining: {remainingSessions}
        </p>

        <input type="hidden" name="email" value={client.email} />
        <input type="hidden" name="slotId" value={slotId} />
        <input type="hidden" name="scheduledAt" value={scheduledAt} />
        <input type="hidden" name="timezone" value={client.timezone} />
        <input type="hidden" name="sessionIntention" value={client.sessionIntention} />

        {state.error ? (
          <p className="type-caption text-warm" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Scheduling…" : "Schedule next session"}
        </Button>
      </form>
    </BookingPanel>
  );
}
