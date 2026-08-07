"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAvailabilitySettingsAction,
  saveAvailabilitySettingsAction,
} from "@/lib/admin/actions/availability";
import type {
  AvailabilitySettingsInput,
  DailyTimeBlockInput,
  WeeklyAvailabilityInput,
} from "@/lib/booking/availability/config-repository";
import { Field, Input } from "@/components/ui/Field";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

type AvailabilitySettingsFormProps = {
  initialSettings: AvailabilitySettingsInput;
  initialWeekly: WeeklyAvailabilityInput[];
  initialBlocks: DailyTimeBlockInput[];
};

export function AvailabilitySettingsForm({
  initialSettings,
  initialWeekly,
  initialBlocks,
}: AvailabilitySettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [weekly, setWeekly] = useState(initialWeekly);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSettings(initialSettings);
    setWeekly(initialWeekly);
    setBlocks(initialBlocks);
  }, [initialSettings, initialWeekly, initialBlocks]);

  function handleSave() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveAvailabilitySettingsAction({ settings, weekly, blocks });
      if ("error" in result) {
        setError(String(result.error));
        return;
      }
      setMessage("Availability settings saved.");
    });
  }

  function updateDay(dayOfWeek: number, patch: Partial<WeeklyAvailabilityInput>) {
    setWeekly((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }

  return (
    <div className="layout-stack-lg">
      <div className="observed-card p-6 md:p-8">
        <h2 className="type-heading-sm">Booking rules</h2>
        <p className="type-body mt-2 text-ink-subtle">
          Business timezone is fixed to Europe/Riga. All online availability is calculated
          in Riga time and stored in UTC.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Minimum notice (hours)" id="minNoticeHours">
            <Input
              id="minNoticeHours"
              type="number"
              min={1}
              value={settings.minNoticeHours}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  minNoticeHours: Number(event.target.value),
                }))
              }
            />
          </Field>
          <Field label="Buffer between sessions (minutes)" id="bufferMinutes">
            <Input
              id="bufferMinutes"
              type="number"
              min={0}
              value={settings.bufferMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  bufferMinutes: Number(event.target.value),
                }))
              }
            />
          </Field>
          <Field label="Booking horizon (days)" id="horizonDays">
            <Input
              id="horizonDays"
              type="number"
              min={7}
              value={settings.horizonDays}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  horizonDays: Number(event.target.value),
                }))
              }
            />
          </Field>
          <Field label="Slot grid step (minutes)" id="slotStepMinutes">
            <Input
              id="slotStepMinutes"
              type="number"
              min={5}
              value={settings.slotStepMinutes}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  slotStepMinutes: Number(event.target.value),
                }))
              }
            />
          </Field>
        </div>
      </div>

      <div className="observed-card p-6 md:p-8">
        <h2 className="type-heading-sm">Weekly online hours</h2>
        <div className="mt-6 layout-stack-md">
          {weekly.map((day) => (
            <div
              key={day.dayOfWeek}
              className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-5 first:border-t-0 first:pt-0 lg:grid-cols-[140px_1fr_1fr_1fr]"
            >
              <label className="flex items-center gap-3 type-body">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) =>
                    updateDay(day.dayOfWeek, { enabled: event.target.checked })
                  }
                />
                {DAY_LABELS[day.dayOfWeek]}
              </label>
              <Field label="Start" id={`start-${day.dayOfWeek}`}>
                <Input
                  id={`start-${day.dayOfWeek}`}
                  type="time"
                  value={day.startTime}
                  disabled={!day.enabled}
                  onChange={(event) =>
                    updateDay(day.dayOfWeek, { startTime: event.target.value })
                  }
                />
              </Field>
              <Field label="End" id={`end-${day.dayOfWeek}`}>
                <Input
                  id={`end-${day.dayOfWeek}`}
                  type="time"
                  value={day.endTime}
                  disabled={!day.enabled}
                  onChange={(event) =>
                    updateDay(day.dayOfWeek, { endTime: event.target.value })
                  }
                />
              </Field>
              <Field label="Note" id={`note-${day.dayOfWeek}`}>
                <Input
                  id={`note-${day.dayOfWeek}`}
                  value={day.note}
                  disabled={!day.enabled}
                  onChange={(event) => updateDay(day.dayOfWeek, { note: event.target.value })}
                />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div className="observed-card p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="type-heading-sm">Daily blocked times</h2>
            <p className="type-body mt-2 text-ink-subtle">
              Applied every working day (lunch, dinner, etc.).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setBlocks((current) => [
                ...current,
                { startTime: "12:00", endTime: "13:00", label: "Break", active: true },
              ])
            }
            className="min-h-11 rounded-md border border-border-subtle px-4 py-2 type-body text-ink"
          >
            Add block
          </button>
        </div>

        <div className="mt-6 layout-stack-md">
          {blocks.map((block, index) => (
            <div
              key={block.id ?? `new-${index}`}
              className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-5 first:border-t-0 first:pt-0 lg:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <Field label="Start" id={`block-start-${index}`}>
                <Input
                  id={`block-start-${index}`}
                  type="time"
                  value={block.startTime}
                  onChange={(event) =>
                    setBlocks((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, startTime: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="End" id={`block-end-${index}`}>
                <Input
                  id={`block-end-${index}`}
                  type="time"
                  value={block.endTime}
                  onChange={(event) =>
                    setBlocks((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, endTime: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Label" id={`block-label-${index}`}>
                <Input
                  id={`block-label-${index}`}
                  value={block.label}
                  onChange={(event) =>
                    setBlocks((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, label: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 type-caption">
                <input
                  type="checkbox"
                  checked={block.active}
                  onChange={(event) =>
                    setBlocks((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, active: event.target.checked }
                          : entry,
                      ),
                    )
                  }
                />
                Active
              </label>
            </div>
          ))}
        </div>
      </div>

      {message ? <p className="type-body text-accent">{message}</p> : null}
      {error ? (
        <p className="type-caption text-warm" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="min-h-11 w-full rounded-md bg-ink px-4 py-2 type-body text-canvas disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}
