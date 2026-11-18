"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendFailedDeliveryAction, cancelSequenceAction, deleteEmailConsentAction } from "@/lib/admin/actions/identity-test";

export function DeliveryActions({ id, canResend, sequenceId, canCancel }: { id?: string; canResend?: boolean; sequenceId?: string; canCancel?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <span className="flex gap-2">
      {canResend && id ? (
        <button type="button" disabled={pending}
          onClick={() => start(async () => { await resendFailedDeliveryAction(id); router.refresh(); })}
          className="type-caption text-accent">Atkārtot</button>
      ) : null}
      {canCancel && sequenceId ? (
        <button type="button" disabled={pending}
          onClick={() => {
            if (!confirm("Atcelt secību?")) return;
            start(async () => { await cancelSequenceAction(sequenceId); router.refresh(); });
          }}
          className="type-caption text-ink-subtle">Atcelt</button>
      ) : null}
    </span>
  );
}

export function ConsentDeleteButton({ consentId }: { consentId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending}
      onClick={() => {
        if (!confirm("Dzēst šo e-pasta ierakstu? Piesaistītās secības tiks dzēstas; iesniegums un piegādes paliks.")) return;
        start(async () => { await deleteEmailConsentAction(consentId); router.refresh(); });
      }}
      className="type-caption text-red-700">Dzēst</button>
  );
}
