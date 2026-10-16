"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import type { PortalContent } from "@/content/i18n/portal";
import {
  clientForgotPasswordAction,
  type ClientAuthState,
} from "@/lib/auth/client-actions";

type ClientForgotPasswordFormProps = {
  copy: PortalContent["forgotPassword"];
};

export function ClientForgotPasswordForm({ copy }: ClientForgotPasswordFormProps) {
  const [state, formAction, pending] = useActionState<ClientAuthState, FormData>(
    clientForgotPasswordAction,
    {},
  );

  if (state.message) {
    return (
      <div className="layout-stack-md">
        <p className="type-body" role="status">
          {state.message}
        </p>
        <Link href="/client/login" className="type-caption text-ink underline">
          {copy.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="layout-stack-md">
      <Field label={copy.email} id="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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

      <p className="text-center">
        <Link href="/client/login" className="type-caption text-ink underline">
          {copy.backToLogin}
        </Link>
      </p>
    </form>
  );
}
