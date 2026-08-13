"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookingUiContent } from "@/content/i18n/types";
import type { AvailabilityDay } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { BookingPanel } from "./BookingPanel";
import {
  BookingMonthCalendar,
  formatSelectedDateHeading,
  parseDateKey,
} from "./BookingMonthCalendar";

const INITIAL_VISIBLE_SLOTS = 8;

type BookingCalendarProps = {
  availability: AvailabilityDay[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, scheduledAt: string) => void;
  timezone?: string;
  loading?: boolean;
  error?: string | null;
  isPackage?: boolean;
  labels: BookingUiContent;
};

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
  timezone = "Europe/Riga",
  loading = false,
  error = null,
  isPackage = false,
  labels,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth() + 1);

  const availableDates = useMemo(
    () => new Set(availability.map((day) => day.date)),
    [availability],
  );

  const availableMonths = useMemo(() => {
    const monthKeys = new Set<string>();
    for (const day of availability) {
      const { year, month } = parseDateKey(day.date);
      monthKeys.add(`${year}-${month}`);
    }
    return Array.from(monthKeys)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        return { year, month };
      });
  }, [availability]);

  useEffect(() => {
    if (availability.length === 0) return;
    const firstDate = availability[0].date;
    const { year, month } = parseDateKey(firstDate);
    setSelectedDate(firstDate);
    setViewYear(year);
    setViewMonth(month);
  }, [availability]);

  const currentMonthIndex = availableMonths.findIndex(
    (entry) => entry.year === viewYear && entry.month === viewMonth,
  );

  const canGoPrevious = currentMonthIndex > 0;
  const canGoNext =
    currentMonthIndex >= 0 && currentMonthIndex < availableMonths.length - 1;

  function goToPreviousMonth() {
    if (!canGoPrevious) return;
    const previous = availableMonths[currentMonthIndex - 1];
    setViewYear(previous.year);
    setViewMonth(previous.month);
  }

  function goToNextMonth() {
    if (!canGoNext) return;
    const next = availableMonths[currentMonthIndex + 1];
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  const selectedDay = useMemo(
    () => availability.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  const visibleSlots = useMemo(() => {
    if (!selectedDay) return [];
    const expanded = expandedDays[selectedDay.date];
    if (expanded) return selectedDay.slots;
    return selectedDay.slots.slice(0, INITIAL_VISIBLE_SLOTS);
  }, [selectedDay, expandedDays]);

  const hiddenSlotCount = selectedDay
    ? Math.max(0, selectedDay.slots.length - INITIAL_VISIBLE_SLOTS)
    : 0;

  const title = isPackage
    ? labels.calendar.packageTitle
    : labels.calendar.title;
  const description = isPackage
    ? labels.calendar.packageDescription
    : labels.calendar.description;

  return (
    <BookingPanel title={title} description={description}>
      <div className="layout-stack-md">
        {isPackage ? (
          <div className="rounded-xl border border-accent/25 bg-accent/5 px-5 py-4">
            <p className="type-body text-ink">
              You&apos;re booking <strong>session 1 of 5</strong> today.
            </p>
            <p className="type-caption mt-2 text-ink-subtle">
              Sessions 2–5 can be scheduled later, one at a time, from your Client Portal.
            </p>
          </div>
        ) : null}

        <p className="type-caption text-ink-subtle">
          Times are shown in your local time ({timezone}).
        </p>

        {loading ? (
          <p className="type-body">{labels.calendar.loading}</p>
        ) : null}

        {error ? (
          <p className="type-body text-warm" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && availability.length === 0 ? (
          <p className="type-body">{labels.calendar.noAvailability}</p>
        ) : null}

        {!loading && availability.length > 0 ? (
          <>
            <BookingMonthCalendar
              viewYear={viewYear}
              viewMonth={viewMonth}
              timezone={timezone}
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
            />

            {selectedDay ? (
              <div className="mx-auto w-full max-w-md layout-stack-sm">
                <h4 className="type-heading-sm pt-2">
                  {formatSelectedDateHeading(selectedDay.date, timezone)}
                </h4>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {visibleSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={selectedSlotId === slot.id}
                      aria-label={`${formatTime(slot.startTime, timezone)}, ${slot.available ? "available" : "unavailable"}`}
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

                {hiddenSlotCount > 0 ? (
                  <button
                    type="button"
                    className="type-accent-link self-start"
                    onClick={() =>
                      setExpandedDays((current) => ({
                        ...current,
                        [selectedDay.date]: !current[selectedDay.date],
                      }))
                    }
                  >
                    {expandedDays[selectedDay.date]
                      ? labels.calendar.showFewerTimes
                      : `${labels.calendar.showMoreTimes} (${hiddenSlotCount})`}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="type-body">{labels.calendar.noSlots}</p>
            )}
          </>
        ) : null}
      </div>
    </BookingPanel>
  );
}
