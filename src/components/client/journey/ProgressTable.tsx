import type { JourneyDashboardData } from "@/lib/journey/journey-repository";

type ProgressTableProps = {
  progress: JourneyDashboardData["progressPreview"];
};

function barWidth(start: number | null, current: number | null, inverted: boolean): number {
  if (start === null || current === null) return 0;
  if (inverted) {
    return Math.max(0, Math.min(100, ((start - current) / 10) * 100 + 50));
  }
  return Math.max(0, Math.min(100, (current / 10) * 100));
}

export function ProgressTable({ progress }: ProgressTableProps) {
  if (!progress.hasAssessments) {
    return (
      <div className="observed-card p-6 md:p-8">
        <p className="type-body text-ink-subtle">
          Your progress will become visible as you check in and reflect.
        </p>
      </div>
    );
  }

  return (
    <div className="observed-card overflow-hidden">
      <div className="hidden grid-cols-[1fr_5rem_5rem] gap-4 border-b border-border-subtle px-6 py-4 md:grid">
        <p className="type-caption">Area</p>
        <p className="type-caption text-right">Starting</p>
        <p className="type-caption text-right">Current</p>
      </div>
      <ul>
        {progress.dimensions.map((row) => (
          <li
            key={row.key}
            className="border-b border-border-subtle px-6 py-5 last:border-b-0"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="type-body text-ink">
                  {row.label}
                  {row.inverted ? (
                    <span className="type-caption ml-2 text-ink-subtle">(lower is improvement)</span>
                  ) : null}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent/70 transition-all"
                    style={{ width: `${barWidth(row.starting, row.current, row.inverted)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-6 md:gap-8">
                <p className="type-caption">
                  <span className="md:hidden">Start: </span>
                  {row.starting ?? "—"}
                </p>
                <p className="type-caption">
                  <span className="md:hidden">Now: </span>
                  {row.current ?? "—"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
