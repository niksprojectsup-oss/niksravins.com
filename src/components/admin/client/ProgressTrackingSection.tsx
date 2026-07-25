"use client";

import { useTransition } from "react";
import { saveChecklistItemAction } from "@/lib/admin/actions/clients";
import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "@/lib/admin/client-constants";
import type { ClientWorkspace } from "@/lib/admin/client-types";

function ChecklistGroup({
  title,
  items,
  values,
  type,
  clientId,
}: {
  title: string;
  items: ReadonlyArray<{ key: string; label: string }>;
  values: Record<string, boolean>;
  type: "BEFORE" | "CURRENT";
  clientId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle(itemKey: string, checked: boolean) {
    startTransition(async () => {
      await saveChecklistItemAction(clientId, {
        type,
        itemKey: itemKey as never,
        checked,
      });
    });
  }

  return (
    <div>
      <h3 className="type-caption text-ink-subtle">{title}</h3>
      <ul className="mt-4 layout-stack-sm">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex items-start gap-3 type-body text-ink cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border-strong accent-accent"
                checked={Boolean(values[item.key])}
                disabled={isPending}
                onChange={(e) => toggle(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressTrackingSection({
  clientId,
  checklist,
}: {
  clientId: string;
  checklist: ClientWorkspace["checklist"];
}) {
  return (
    <section className="observed-card p-6 md:p-8">
      <div className="layout-stack-sm">
        <h2 className="type-heading-sm">Progress tracking</h2>
        <p className="type-body">
          Observable shifts in how the reaction shows up in daily life.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <ChecklistGroup
          title="Before"
          items={BEFORE_CHECKLIST_ITEMS}
          values={checklist.before}
          type="BEFORE"
          clientId={clientId}
        />
        <ChecklistGroup
          title="Current"
          items={CURRENT_CHECKLIST_ITEMS}
          values={checklist.current}
          type="CURRENT"
          clientId={clientId}
        />
      </div>
    </section>
  );
}
