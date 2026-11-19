"use client";

import { useState, useTransition } from "react";
import { inviteClientByEmailAction } from "@/lib/admin/actions/clients";

export function InviteClientForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await inviteClientByEmailAction({ email, firstName, lastName });
      if ("error" in res && res.error) {
        setMessage({ ok: false, text: res.error });
        return;
      }
      setMessage({
        ok: true,
        text: res.createdClient
          ? "Invitation sent. A new client record was created."
          : "Invitation sent to the existing client.",
      });
      setEmail("");
      setFirstName("");
      setLastName("");
    });
  };

  return (
    <form onSubmit={submit} className="observed-card p-6">
      <h2 className="type-heading-sm">Invite to Client Portal</h2>
      <p className="mt-1 text-sm text-ink-subtle">
        Enter an email address to create a client record and send a portal invitation email with a password setup link.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="block">
          <span className="type-caption text-ink-subtle">Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="type-caption text-ink-subtle">First name</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="type-caption text-ink-subtle">Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-9 rounded-md bg-accent px-4 text-sm font-medium text-surface hover:bg-accent-strong disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send invitation email"}
        </button>
        {message && (
          <p className={`text-sm ${message.ok ? "text-accent" : "text-red-700"}`}>{message.text}</p>
        )}
      </div>
    </form>
  );
}
