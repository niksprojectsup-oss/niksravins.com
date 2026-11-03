"use client";

import { useState } from "react";
import { setLatvianBookingFlagAction } from "@/lib/admin/actions/feature-flags";
import { cn } from "@/lib/utils";

export function LatvianBookingToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    setError(null);
    try {
      await setLatvianBookingFlagAction(next);
      setEnabled(next);
    } catch {
      setError("Unable to update the setting. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        role="switch"
        aria-checked={enabled}
        className={cn(
          "inline-flex w-fit items-center gap-3 rounded-md border px-4 py-2 text-sm transition-colors",
          enabled
            ? "border-accent bg-accent-soft text-ink"
            : "border-border-subtle bg-surface text-ink-muted",
        )}
      >
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            enabled ? "bg-accent" : "bg-ink-faint",
          )}
        />
        Latvian Booking: {enabled ? "ON" : "OFF"}
      </button>
      <p className="type-caption text-ink-subtle">
        {enabled
          ? "Latvian visitors can book sessions at /lv."
          : "The booking button is hidden and /lv/book is blocked for Latvian visitors. English booking is unaffected."}
      </p>
      {error ? <p className="type-caption text-warm" role="alert">{error}</p> : null}
    </div>
  );
}
