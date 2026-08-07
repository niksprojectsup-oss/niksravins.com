"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import {
  markSessionCompletedAction,
  schedulePackageSessionAction,
} from "@/lib/admin/actions/clients";
import { getAvailabilityAction } from "@/lib/booking/actions";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { ClientPackageRecord } from "@/lib/admin/client-types";
import type { AvailabilityDay } from "@/lib/booking/types";

type PackageManagementSectionProps = {
  clientId: string;
  packages: ClientPackageRecord[];
};

function PackageCard({ clientId, pkg }: { clientId: string; pkg: ClientPackageRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedScheduledAt, setSelectedScheduledAt] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const nextSessionNumber = pkg.nextSchedulableSessionNumber;
  const nextSlotLabel =
    nextSessionNumber != null ? `Session ${nextSessionNumber}` : null;

  useEffect(() => {
    if (!isScheduling) return;

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    getAvailabilityAction(
      pkg.serviceId as "initial-aap-session" | "aap-transformation-package",
      "Europe/Riga",
    )
      .then((days) => {
        if (!cancelled) setAvailability(days);
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability([]);
          setAvailabilityError("Unable to load available times. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isScheduling, pkg.serviceId]);

  function handleSchedule() {
    if (!selectedSlotId || !selectedScheduledAt) return;
    setError(null);
    startTransition(async () => {
      const result = await schedulePackageSessionAction(
        clientId,
        pkg.id,
        selectedSlotId,
        selectedScheduledAt,
      );
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setIsScheduling(false);
      setSelectedSlotId(null);
      setSelectedScheduledAt(null);
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

      {pkg.canScheduleNext && nextSlotLabel ? (
        <div className="mt-6">
          {!isScheduling ? (
            <button
              type="button"
              onClick={() => setIsScheduling(true)}
              disabled={isPending}
              className="min-h-11 rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60"
            >
              Schedule next session ({nextSlotLabel})
            </button>
          ) : (
            <div className="layout-stack-md border-t border-border-subtle pt-6">
              <h4 className="type-label">Choose a time for {nextSlotLabel}</h4>
              <BookingCalendar
                availability={availability}
                selectedSlotId={selectedSlotId}
                onSelectSlot={(slotId, scheduledAt) => {
                  setSelectedSlotId(slotId);
                  setSelectedScheduledAt(scheduledAt);
                }}
                timezone="Europe/Riga"
                loading={availabilityLoading}
                error={availabilityError}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={isPending || !selectedSlotId || !selectedScheduledAt}
                  className="min-h-11 rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60"
                >
                  Save session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduling(false);
                    setSelectedSlotId(null);
                    setSelectedScheduledAt(null);
                    setAvailabilityError(null);
                  }}
                  className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

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
              </div>
            </li>
          ))}
        </ol>
      </div>

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
