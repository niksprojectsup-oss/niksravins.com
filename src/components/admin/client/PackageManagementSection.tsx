"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Field, Input } from "@/components/ui/Field";
import {
  markSessionCompletedAction,
  schedulePackageSessionAction,
} from "@/lib/admin/actions/clients";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { ClientPackageRecord } from "@/lib/admin/client-types";

type PackageManagementSectionProps = {
  clientId: string;
  packages: ClientPackageRecord[];
};

function PackageCard({ clientId, pkg }: { clientId: string; pkg: ClientPackageRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [schedulingSlot, setSchedulingSlot] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");

  const nextUnscheduled = pkg.timeline.find((slot) => slot.status === "not_scheduled");
  const canScheduleMore = pkg.status === "active" && nextUnscheduled != null;

  function handleSchedule() {
    if (!scheduledAt) return;
    setError(null);
    startTransition(async () => {
      const result = await schedulePackageSessionAction(clientId, pkg.id, scheduledAt);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSchedulingSlot(null);
      setScheduledAt("");
      router.refresh();
    });
  }

  function handleComplete(sessionId: string) {
    setError(null);
    startTransition(async () => {
      const result = await markSessionCompletedAction(clientId, sessionId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="type-body text-ink">{pkg.serviceTitle}</h3>
          <p className="type-caption mt-1">
            Purchased {formatAdminDateTime(pkg.createdAt)}
          </p>
        </div>
        <AdminStatusBadge label={pkg.status} variant="accent" />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <dt className="type-caption">Total sessions</dt>
          <dd className="type-body mt-1 text-ink">{pkg.totalSessions}</dd>
        </div>
        <div>
          <dt className="type-caption">Completed</dt>
          <dd className="type-body mt-1 text-ink">{pkg.completedSessions}</dd>
        </div>
        <div>
          <dt className="type-caption">Remaining</dt>
          <dd className="type-body mt-1 text-ink">{pkg.remainingSessions}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h4 className="type-label">Session timeline</h4>
        <ol className="mt-4 layout-stack-sm">
          {pkg.timeline.map((slot) => (
            <li
              key={slot.sessionNumber}
              className="flex flex-col gap-3 border-t border-border-subtle py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="type-body text-ink">{slot.label}</p>
                {slot.scheduledAt ? (
                  <p className="type-caption mt-1">
                    {formatAdminDateTime(slot.scheduledAt)}
                  </p>
                ) : (
                  <p className="type-caption mt-1 text-ink-subtle">Not scheduled yet</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AdminStatusBadge
                  label={slot.status.replace("_", " ")}
                  variant={slot.status === "completed" ? "default" : "accent"}
                />

                {slot.status === "scheduled" && slot.sessionId ? (
                  <button
                    type="button"
                    onClick={() => handleComplete(slot.sessionId!)}
                    disabled={isPending}
                    className="min-h-10 rounded-md border border-border-subtle px-3 type-caption text-ink disabled:opacity-60"
                  >
                    Mark completed
                  </button>
                ) : null}

                {slot.status === "not_scheduled" &&
                canScheduleMore &&
                nextUnscheduled?.sessionNumber === slot.sessionNumber ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSchedulingSlot(
                        schedulingSlot === slot.sessionNumber ? null : slot.sessionNumber,
                      )
                    }
                    disabled={isPending}
                    className="min-h-10 rounded-md border border-border-subtle px-3 type-caption text-ink disabled:opacity-60"
                  >
                    Schedule
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {schedulingSlot != null ? (
        <div className="mt-6 layout-stack-md border-t border-border-subtle pt-6">
          <Field label={`Schedule ${pkg.timeline.find((s) => s.sessionNumber === schedulingSlot)?.label}`} id={`schedule-${pkg.id}`}>
            <Input
              id={`schedule-${pkg.id}`}
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSchedule}
              disabled={isPending || !scheduledAt}
              className="min-h-11 rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60"
            >
              Save session
            </button>
            <button
              type="button"
              onClick={() => {
                setSchedulingSlot(null);
                setScheduledAt("");
              }}
              className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="type-caption mt-4 text-warm" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}

export function PackageManagementSection({
  clientId,
  packages,
}: PackageManagementSectionProps) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Transformation packages</h2>
      <p className="type-body mt-2 text-ink-subtle">
        Track package progress, schedule remaining sessions, and mark sessions complete.
      </p>

      <div className="mt-8 layout-stack-lg">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} clientId={clientId} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
