import type { JourneyMilestone } from "@/lib/journey/milestones";

export function MilestoneTimeline({ milestones }: { milestones: JourneyMilestone[] }) {
  const visible = milestones.filter((m) => m.achieved || m.key !== "first_breakthrough");

  return (
    <ol className="layout-stack-sm border-l border-border-subtle pl-6">
      {visible.map((milestone) => (
        <li key={milestone.key} className="relative pb-6 last:pb-0">
          <span
            className={`absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full ${
              milestone.achieved ? "bg-accent" : "bg-border-subtle"
            }`}
            aria-hidden
          />
          <p className={`type-body ${milestone.achieved ? "text-ink" : "text-ink-faint"}`}>
            {milestone.label.toUpperCase()}
          </p>
          {milestone.achieved && milestone.achievedAt ? (
            <p className="type-caption mt-1">
              {new Date(milestone.achievedAt).toLocaleDateString()}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
