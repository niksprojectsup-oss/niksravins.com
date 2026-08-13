"use client";

import { useMemo } from "react";
import { getDateKeyInTimeZone, getIsoDayOfWeek, zonedLocalToUtc, formatInTimeZone } from "@/lib/booking/timezone";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type MonthCalendarCell =
  | { kind: "empty" }
  | {
      kind: "day";
      dateKey: string;
      day: number;
      available: boolean;
      isToday: boolean;
      selected: boolean;
    };

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildMonthGrid(
  year: number,
  month: number,
  timezone: string,
  availableDates: Set<string>,
  selectedDate: string | null,
  todayKey: string,
): MonthCalendarCell[] {
  const totalDays = daysInMonth(year, month);
  const firstDateKey = `${year}-${String(month).padStart(2, "0")}-01`;
  const startOffset = getIsoDayOfWeek(firstDateKey, timezone) - 1;
  const cells: MonthCalendarCell[] = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ kind: "empty" });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      kind: "day",
      dateKey,
      day,
      available: availableDates.has(dateKey),
      isToday: dateKey === todayKey,
      selected: dateKey === selectedDate,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: "empty" });
  }

  return cells;
}

function formatMonthTitle(year: number, month: number, timezone: string): string {
  const anchor = zonedLocalToUtc(`${year}-${String(month).padStart(2, "0")}-01`, "12:00", timezone);
  return formatInTimeZone(anchor.toISOString(), timezone, {
    month: "long",
    year: "numeric",
  });
}

function formatDateAriaLabel(
  dateKey: string,
  timezone: string,
  available: boolean,
  selected: boolean,
  isToday: boolean,
): string {
  const anchor = zonedLocalToUtc(dateKey, "12:00", timezone);
  const formatted = formatInTimeZone(anchor.toISOString(), timezone, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const parts = [formatted];
  if (isToday) parts.push("today");
  if (selected) parts.push("selected");
  parts.push(available ? "available" : "unavailable");
  return parts.join(", ");
}

export function formatSelectedDateHeading(dateKey: string, timezone: string): string {
  const anchor = zonedLocalToUtc(dateKey, "12:00", timezone);
  return formatInTimeZone(anchor.toISOString(), timezone, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type BookingMonthCalendarProps = {
  viewYear: number;
  viewMonth: number;
  timezone: string;
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
};

export function BookingMonthCalendar({
  viewYear,
  viewMonth,
  timezone,
  availableDates,
  selectedDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  canGoPrevious,
  canGoNext,
}: BookingMonthCalendarProps) {
  const todayKey = useMemo(
    () => getDateKeyInTimeZone(new Date(), timezone),
    [timezone],
  );

  const cells = useMemo(
    () =>
      buildMonthGrid(
        viewYear,
        viewMonth,
        timezone,
        availableDates,
        selectedDate,
        todayKey,
      ),
    [viewYear, viewMonth, timezone, availableDates, selectedDate, todayKey],
  );

  const weeks = useMemo(() => {
    const rows: MonthCalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cells]);

  const monthTitle = formatMonthTitle(viewYear, viewMonth, timezone);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPreviousMonth}
          disabled={!canGoPrevious}
          aria-label="Previous month"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-colors",
            canGoPrevious
              ? "border-border-subtle text-ink hover:border-accent hover:text-accent"
              : "cursor-not-allowed border-border-subtle text-ink-faint opacity-50",
          )}
        >
          ‹
        </button>
        <h3 className="type-body text-center font-medium text-ink">{monthTitle}</h3>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={!canGoNext}
          aria-label="Next month"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-colors",
            canGoNext
              ? "border-border-subtle text-ink hover:border-accent hover:text-accent"
              : "cursor-not-allowed border-border-subtle text-ink-faint opacity-50",
          )}
        >
          ›
        </button>
      </div>

      <div
        role="grid"
        aria-label={`${monthTitle} availability calendar`}
        className="mt-5 rounded-xl border border-border-subtle bg-surface/40 p-3 sm:p-4"
      >
        <div role="row" className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="type-caption py-2 text-center text-ink-subtle"
            >
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
            {week.map((cell, cellIndex) => {
              if (cell.kind === "empty") {
                return (
                  <div
                    key={`empty-${weekIndex}-${cellIndex}`}
                    role="gridcell"
                    aria-hidden
                    className="aspect-square"
                  />
                );
              }

              const { dateKey, day, available, isToday, selected } = cell;

              return (
                <button
                  key={dateKey}
                  type="button"
                  role="gridcell"
                  disabled={!available}
                  aria-label={formatDateAriaLabel(
                    dateKey,
                    timezone,
                    available,
                    selected,
                    isToday,
                  )}
                  aria-pressed={selected}
                  onClick={() => onSelectDate(dateKey)}
                  className={cn(
                    "relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-lg border text-sm transition-colors",
                    available
                      ? "border-transparent text-ink hover:border-accent/40 hover:bg-accent/5"
                      : "cursor-not-allowed border-transparent text-ink-faint opacity-40",
                    selected &&
                      "border-accent bg-accent-soft font-medium text-ink ring-2 ring-accent/20",
                    isToday && !selected && "border-border-subtle bg-canvas font-medium",
                  )}
                >
                  <span>{day}</span>
                  {available ? (
                    <span
                      className={cn(
                        "mt-0.5 h-1.5 w-1.5 rounded-full",
                        selected ? "bg-accent" : "bg-accent/70",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { parseDateKey };
