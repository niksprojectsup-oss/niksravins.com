"use client";

import { useMemo, useState } from "react";
import type { CalendarSlot } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import {
  AdminStatusBadge,
} from "./AdminStatusBadge";

type AdminCalendarProps = {
  slots: CalendarSlot[];
  monthKey: string;
  onMonthChange: (monthKey: string) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return { year, month: month - 1 };
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function AdminCalendar({
  slots,
  monthKey,
  onMonthChange,
}: AdminCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { year, month } = parseMonthKey(monthKey);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ date: string | null; dayNumber: number | null }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null, dayNumber: null });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      cells.push({ date: date.toISOString().slice(0, 10), dayNumber: day });
    }

    return cells;
  }, [year, month]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
    slots.forEach((slot) => {
      const existing = map.get(slot.date) ?? [];
      existing.push(slot);
      map.set(slot.date, existing);
    });
    return map;
  }, [slots]);

  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  function shiftMonth(delta: number) {
    const date = new Date(year, month + delta, 1);
    onMonthChange(toMonthKey(date));
    setSelectedDate(null);
  }

  return (
    <div className="layout-stack-md">
      <div className="flex items-center justify-between gap-4">
        <h2 className="type-heading-sm">{formatMonthLabel(monthKey)}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="min-h-10 rounded-md border border-border-subtle px-3 text-sm text-ink-muted hover:border-border"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="min-h-10 rounded-md border border-border-subtle px-3 text-sm text-ink-muted hover:border-border"
          >
            Next
          </button>
        </div>
      </div>

      <div className="observed-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-muted/40">
          {WEEKDAYS.map((day) => (
            <div key={day} className="type-caption px-2 py-3 text-center text-ink-subtle">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((cell, index) => {
            if (!cell.date || !cell.dayNumber) {
              return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-border-subtle bg-canvas/40" />;
            }

            const daySlots = slotsByDate.get(cell.date) ?? [];
            const booked = daySlots.filter((slot) => slot.kind === "booked").length;
            const available = daySlots.filter((slot) => slot.kind === "available").length;
            const isSelected = selectedDate === cell.date;

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => setSelectedDate(cell.date)}
                className={cn(
                  "min-h-24 border-b border-r border-border-subtle p-2 text-left transition-colors hover:bg-surface-muted/30",
                  isSelected && "bg-accent-soft/50",
                )}
              >
                <span className="type-caption text-ink">{cell.dayNumber}</span>
                <div className="mt-2 layout-stack-sm">
                  {available > 0 ? (
                    <span className="block type-caption text-accent">{available} open</span>
                  ) : null}
                  {booked > 0 ? (
                    <span className="block type-caption text-ink-subtle">{booked} booked</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="observed-card p-6 md:p-7">
        <h3 className="type-heading-sm">
          {selectedDate ? `Slots · ${selectedDate}` : "Select a day"}
        </h3>
        {selectedDaySlots.length > 0 ? (
          <ul className="mt-4 layout-stack-sm">
            {selectedDaySlots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-col gap-2 border-t border-border-subtle pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="type-body text-ink">
                    {new Intl.DateTimeFormat("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(slot.startTime))}
                    {" – "}
                    {new Intl.DateTimeFormat("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(slot.endTime))}
                  </p>
                  {slot.clientName ? (
                    <p className="type-caption">{slot.clientName}</p>
                  ) : null}
                  {slot.serviceTitle ? (
                    <p className="type-caption text-ink-faint">{slot.serviceTitle}</p>
                  ) : null}
                </div>
                {slot.kind === "booked" && slot.status ? (
                  <AdminStatusBadge
                    label={slot.status}
                    variant={slot.status === "scheduled" ? "accent" : "default"}
                  />
                ) : (
                  <AdminStatusBadge
                    label={slot.kind === "booked" ? "Booked" : "Available"}
                    variant={slot.kind === "booked" ? "default" : "accent"}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body mt-4">
            {selectedDate ? "No slots on this day." : "Choose a date to view availability and bookings."}
          </p>
        )}
      </section>
    </div>
  );
}
