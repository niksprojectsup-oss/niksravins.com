"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import type { PortalContent } from "@/content/i18n/portal";
import {
  clientSetPasswordAction,
  type ClientAuthState,
} from "@/lib/auth/client-actions";

type ClientSetPasswordFormProps = {
  token: string;
  initialError?: string;
  copy: PortalContent["setPassword"];
};

export function ClientSetPasswordForm({
  token,
  initialError,
  copy,
}: ClientSetPasswordFormProps) {
  const [state, formAction, pending] = useActionState<ClientAuthState, FormData>(
    clientSetPasswordAction,
    { error: initialError },
  );

  return (
    <form action={formAction} className="layout-stack-md">
      <input type="hidden" name="token" value={token} />

      <Field label={copy.password} id="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      <Field label={copy.confirm} id="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      {state.error ? (
        <p className="type-caption text-warm" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-12 rounded-md bg-ink px-4 py-3 type-body text-canvas transition-opacity duration-200 disabled:opacity-60"
      >
        {pending ? copy.pending : copy.submit}
      </button>
    </form>
  );
}
