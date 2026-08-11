"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resendPortalSetupEmailAction } from "@/lib/admin/actions/clients";

type PortalSetupResendButtonProps = {
  clientId: string;
};

export function PortalSetupResendButton({ clientId }: PortalSetupResendButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleResend() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await resendPortalSetupEmailAction(clientId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setMessage("Portal setup email sent.");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 border-t border-border-subtle pt-6">
      <p className="type-caption text-ink-subtle">Client Portal</p>
      <p className="type-body mt-2 text-ink-muted">
        Send or resend the password setup email for clients who have not created a portal
        password yet.
      </p>
      <button
        type="button"
        onClick={handleResend}
        disabled={isPending}
        className="mt-4 inline-flex min-h-11 items-center rounded-md border border-border-subtle bg-surface px-4 text-sm text-ink transition-colors hover:border-border disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send portal setup email"}
      </button>
      {message ? <p className="type-caption mt-3 text-accent">{message}</p> : null}
      {error ? (
        <p className="type-caption mt-3 text-warm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
