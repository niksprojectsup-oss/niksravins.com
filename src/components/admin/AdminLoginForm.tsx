"use client";

import { useActionState } from "react";
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

      <div className="layout-stack-sm">
        <label htmlFor="email" className="type-caption block text-ink-subtle">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-md border border-border-subtle bg-canvas px-3 py-2 type-body text-ink"
        />
      </div>

      <div className="layout-stack-sm">
        <label htmlFor="password" className="type-caption block text-ink-subtle">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-border-subtle bg-canvas px-3 py-2 type-body text-ink"
        />
      </div>

      {state.error ? (
        <p className="type-caption text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink px-4 py-3 type-body text-canvas transition-opacity duration-200 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
