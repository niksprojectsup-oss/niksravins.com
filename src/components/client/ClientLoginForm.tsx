"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import {
  clientLoginAction,
  type ClientAuthState,
} from "@/lib/auth/client-actions";

type ClientLoginFormProps = {
  nextPath?: string;
  initialError?: string;
};

export function ClientLoginForm({ nextPath, initialError }: ClientLoginFormProps) {
  const [state, formAction, pending] = useActionState<ClientAuthState, FormData>(
    clientLoginAction,
    { error: initialError },
  );

  return (
    <form action={formAction} className="layout-stack-md">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <Field label="Email" id="client-email">
        <Input
          id="client-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </Field>

      <Field label="Password" id="client-password">
        <Input
          id="client-password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
