"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { Button } from "@/components/ui/Button";
import { clientPortalContent } from "@/content/client-portal";
import { getAvailabilityAction } from "@/lib/booking/availability-actions";
import type { AvailabilityDay } from "@/lib/booking/types";
import { bookPackageSessionAction } from "@/lib/client/package-booking-actions";
import { cn } from "@/lib/utils";

type PackageSessionBookingFlowProps = {
  packageId: string;
  packageTitle: string;
  timezone: string;
};

function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Riga";
  } catch {
    return "Europe/Riga";
  }
}

export function PackageSessionBookingFlow({
  packageId,
  packageTitle,
  timezone: clientTimezone,
}: PackageSessionBookingFlowProps) {
  const [displayTimezone, setDisplayTimezone] = useState(clientTimezone);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const detected = detectBrowserTimezone();
    setDisplayTimezone(detected || clientTimezone);
  }, [clientTimezone]);

  useEffect(() => {
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    getAvailabilityAction("aap-transformation-package", displayTimezone)
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
  }, [displayTimezone]);

  const handleSelectSlot = useCallback((nextSlotId: string, nextScheduledAt: string) => {
    setSlotId(nextSlotId);
    setScheduledAt(nextScheduledAt);
    setFormError(null);
  }, []);

  const handleConfirm = () => {
    if (!slotId || !scheduledAt) {
      setFormError("Please select a time.");
      return;
    }

    startTransition(async () => {
      const result = await bookPackageSessionAction(
        packageId,
        slotId,
        scheduledAt,
        displayTimezone,
      );

      if (result.error) {
        setFormError(result.error);
        return;
      }

      window.location.href = "/client/dashboard";
    });
  };

  return (
    <div className="layout-stack-lg">
      <div>
        <Link
          href="/client/dashboard"
          className="type-caption text-ink-subtle no-underline hover:text-ink"
        >
          ← Back to dashboard
        </Link>
        <h1 className="type-heading mt-4">{clientPortalContent.packageBooking.title}</h1>
        <p className="type-body mt-2 text-ink-muted">{packageTitle}</p>
      </div>

      <BookingCalendar
        availability={availability}
        selectedSlotId={slotId}
        onSelectSlot={handleSelectSlot}
        timezone={displayTimezone}
        loading={availabilityLoading}
        error={availabilityError}
      />

      {formError ? (
        <p className="type-body text-warm" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!slotId || isPending || availabilityLoading}
          className={cn(isPending && "opacity-70")}
        >
          {isPending
            ? clientPortalContent.packageBooking.confirming
            : clientPortalContent.packageBooking.confirm}
        </Button>
        <Button href="/client/dashboard" variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}
