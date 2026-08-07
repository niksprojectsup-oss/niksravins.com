"use client";

import { useEffect, useMemo, useState } from "react";
import { bookingContent } from "@/content/booking";
import type { AvailabilityDay } from "@/lib/booking/types";
import { formatSlotDayTab, zonedLocalToUtc } from "@/lib/booking/timezone";
import { cn } from "@/lib/utils";
import { BookingPanel } from "./BookingPanel";

type BookingCalendarProps = {
  availability: AvailabilityDay[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, scheduledAt: string) => void;
  timezone?: string;
  loading?: boolean;
  error?: string | null;
};

function formatTime(iso: string, timezone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone ?? undefined,
  }).format(new Date(iso));
}

function formatDayLabel(dateStr: string, timezone: string): string {
  const anchor = zonedLocalToUtc(dateStr, "12:00", timezone);
  return formatSlotDayTab(anchor.toISOString(), timezone);
}

export function BookingCalendar({
  availability,
  selectedSlotId,
  onSelectSlot,
  timezone = "Europe/Riga",
  loading = false,
  error = null,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(availability[0]?.date ?? null);
  }, [availability]);

  const selectedDay = useMemo(
    () => availability.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  return (
    <BookingPanel
      title={bookingContent.calendar.title}
      description={bookingContent.calendar.description}
    >
      <div className="layout-stack-md">
        <p className="type-caption text-ink-subtle">
          Times shown in your timezone ({timezone}). Sessions are delivered online based
          on Niks Ravins&apos; Europe/Riga schedule.
        </p>

        {loading ? (
          <p className="type-body">{bookingContent.calendar.loading}</p>
        ) : null}

        {error ? (
          <p className="type-body text-warm" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && availability.length === 0 ? (
          <p className="type-body">{bookingContent.calendar.noAvailability}</p>
        ) : null}

        {!loading && availability.length > 0 ? (
          <>
            <div
              role="tablist"
              aria-label="Available dates"
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {availability.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  role="tab"
                  aria-selected={selectedDate === day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "shrink-0 rounded-md border px-4 py-3 text-sm transition-colors duration-200",
                    selectedDate === day.date
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-border-subtle bg-surface text-ink-muted hover:border-border",
                  )}
                >
                  {formatDayLabel(day.date, timezone)}
                </button>
              ))}
            </div>

            {selectedDay ? (
              <div
                role="tabpanel"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
              >
                {selectedDay.slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!slot.available}
                    aria-pressed={selectedSlotId === slot.id}
                    onClick={() => onSelectSlot(slot.id, slot.startTime)}
                    className={cn(
                      "min-h-12 rounded-md border px-3 py-3 text-sm transition-colors duration-200",
                      selectedSlotId === slot.id
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-border-subtle bg-surface text-ink-muted hover:border-border",
                      !slot.available && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {formatTime(slot.startTime, timezone)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="type-body">{bookingContent.calendar.noSlots}</p>
            )}
          </>
        ) : null}
      </div>
    </BookingPanel>
  );
}
