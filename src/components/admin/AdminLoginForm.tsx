"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import { loginAction } from "@/lib/auth/actions";

type AdminLoginFormProps = {
  nextPath?: string;
  initialError?: string;
};

type LoginState = {
  error?: string;
};

async function loginWithState(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await loginAction(formData);
  return result ?? {};
}

export function AdminLoginForm({ nextPath, initialError }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(loginWithState, {
    error: initialError,
  });

  return (
    <form action={formAction} className="layout-stack-md">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <Field label="Email" id="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </Field>

      <Field label="Password" id="password">
        <Input
          id="password"
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
