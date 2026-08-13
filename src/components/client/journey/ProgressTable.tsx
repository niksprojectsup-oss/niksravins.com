import type { JourneyDashboardData } from "@/lib/journey/journey-repository";
import { PortalCard } from "./PortalShell";

type ProgressTableProps = {
  progress: JourneyDashboardData["progressPreview"];
  compact?: boolean;
};

function barWidth(start: number | null, current: number | null, inverted: boolean): number {
  if (start === null || current === null) return 0;
  if (inverted) {
    return Math.max(0, Math.min(100, ((start - current) / 10) * 100 + 50));
  }
  return Math.max(0, Math.min(100, (current / 10) * 100));
}

export function ProgressTable({ progress, compact = false }: ProgressTableProps) {
  if (!progress.hasAssessments) {
    return (
      <PortalCard>
        <p className="type-body text-ink-subtle">
          Your progress will become visible as you check in and reflect.
        </p>
      </PortalCard>
    );
  }

  const rows = compact ? progress.dimensions.slice(0, 4) : progress.dimensions;

  return (
    <PortalCard padding={compact ? "sm" : "md"} className="overflow-hidden !p-0">
      <ul>
        {rows.map((row) => (
          <li
            key={row.key}
            className="border-b border-border-subtle px-5 py-4 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="type-body text-ink">{row.label}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-all"
                    style={{ width: `${barWidth(row.starting, row.current, row.inverted)}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="type-caption">{row.current ?? "—"}</p>
                {!compact ? (
                  <p className="type-caption text-ink-faint">from {row.starting ?? "—"}</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PortalCard>
  );
}
