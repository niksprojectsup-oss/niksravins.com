"use client";

import { useMemo, useState } from "react";
import { bookingContent } from "@/content/booking";
import type { AvailabilityDay } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { BookingPanel } from "./BookingPanel";

type BookingCalendarProps = {
  availability: AvailabilityDay[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, scheduledAt: string) => void;
  timezone?: string;
};

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTime(iso: string, timezone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone ?? undefined,
  }).format(new Date(iso));
}

export function BookingCalendar({
  availability,
  selectedSlotId,
  onSelectSlot,
  timezone,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    availability[0]?.date ?? null,
  );

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
              {formatDayLabel(day.date)}
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
      </div>
    </BookingPanel>
  );
}
