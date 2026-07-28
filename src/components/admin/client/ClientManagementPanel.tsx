"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { countries, timezones } from "@/content/booking";
import { Field, Input, Select } from "@/components/ui/Field";
import {
  archiveClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/lib/admin/actions/clients";
import type { ClientWorkspace } from "@/lib/admin/client-types";

type ClientManagementPanelProps = {
  client: ClientWorkspace;
};

export function ClientManagementPanel({ client }: ClientManagementPanelProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    country: client.country,
    timezone: client.timezone,
  });

  function handleUpdate() {
    setError(null);
    startTransition(async () => {
      const result = await updateClientAction(client.id, form);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await archiveClientAction(client.id);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      await deleteClientAction(client.id);
      router.push("/admin/clients");
      router.refresh();
    });
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-heading-sm">Client management</h2>
          <p className="type-body mt-2 text-ink-subtle">
            Edit details, archive, or permanently remove this client record.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
            >
              Edit client
            </button>
          ) : null}

          {client.status !== "ARCHIVED" ? (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isPending}
              className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink-subtle"
            >
              Archive client
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-warm"
          >
            Delete client
          </button>
        </div>
      </div>

      {error ? (
        <p className="type-caption mt-4 text-warm" role="alert">
          {error}
        </p>
      ) : null}

      {isEditing ? (
        <div className="mt-6 layout-stack-md border-t border-border-subtle pt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="First name" id="edit-firstName">
              <Input
                id="edit-firstName"
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
              />
            </Field>
            <Field label="Last name" id="edit-lastName">
              <Input
                id="edit-lastName"
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Email" id="edit-email">
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Country" id="edit-country">
              <Select
                id="edit-country"
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Time zone" id="edit-timezone">
              <Select
                id="edit-timezone"
                value={form.timezone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, timezone: event.target.value }))
                }
              >
                {timezones.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isPending}
              className="min-h-11 rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setForm({
                  firstName: client.firstName,
                  lastName: client.lastName,
                  email: client.email,
                  country: client.country,
                  timezone: client.timezone,
                });
              }}
              className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showDeleteDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4"
          role="presentation"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border-subtle bg-surface p-6 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-client-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="delete-client-title" className="type-heading-sm">
              Delete this client?
            </h3>
            <p className="type-body mt-3 text-ink-subtle">
              This action cannot be undone.
            </p>
            <p className="type-caption mt-4 text-ink-faint">
              Related bookings, sessions, progress records, reaction analysis, and
              notes will also be removed.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="min-h-11 rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60"
              >
                Delete permanently
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
