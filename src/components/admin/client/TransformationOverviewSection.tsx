import { formatAdminDate } from "@/lib/admin/format";
import type { AdminTransformationOverview } from "@/lib/journey/admin-journey-repository";

export function TransformationOverviewSection({
  overview,
}: {
  overview: AdminTransformationOverview;
}) {
  return (
    <section className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Transformation overview</h2>

      {overview.package ? (
        <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <dt className="type-caption">Package</dt>
            <dd className="type-body mt-1">{overview.package.serviceTitle}</dd>
          </div>
          <div>
            <dt className="type-caption">Sessions completed</dt>
            <dd className="type-body mt-1">{overview.package.completedSessions}</dd>
          </div>
          <div>
            <dt className="type-caption">Sessions remaining</dt>
            <dd className="type-body mt-1">{overview.package.remainingSessions}</dd>
          </div>
          <div>
            <dt className="type-caption">Package status</dt>
            <dd className="type-body mt-1 capitalize">{overview.package.status}</dd>
          </div>
        </dl>
      ) : (
        <p className="type-body mt-4">No active transformation package.</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="type-label">Latest check-in</h3>
          {overview.latestCheckIn ? (
            <p className="type-body mt-2">
              {overview.latestCheckIn.checkInDate} · {overview.latestCheckIn.mood} · intensity{" "}
              {overview.latestCheckIn.intensity}/10
            </p>
          ) : (
            <p className="type-body mt-2 text-ink-subtle">No check-ins yet.</p>
          )}
        </div>

        <div>
          <h3 className="type-label">Latest shared journal</h3>
          {overview.latestSharedJournal ? (
            <div className="mt-2">
              <p className="type-caption">{formatAdminDate(overview.latestSharedJournal.createdAt)}</p>
              <p className="type-body mt-2 whitespace-pre-wrap">
                {overview.latestSharedJournal.content}
              </p>
            </div>
          ) : (
            <p className="type-body mt-2 text-ink-subtle">No shared journal entries.</p>
          )}
        </div>

        <div>
          <h3 className="type-label">Latest shared session reflection</h3>
          {overview.latestSharedReflection ? (
            <div className="mt-2 layout-stack-sm">
              <p className="type-caption">
                Rating {overview.latestSharedReflection.rating}/5 ·{" "}
                {formatAdminDate(overview.latestSharedReflection.createdAt)}
              </p>
              {overview.latestSharedReflection.valuablePart ? (
                <p className="type-body">{overview.latestSharedReflection.valuablePart}</p>
              ) : null}
              {overview.latestSharedReflection.messageToPractitioner ? (
                <p className="type-body">
                  <span className="text-ink-subtle">Message: </span>
                  {overview.latestSharedReflection.messageToPractitioner}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="type-body mt-2 text-ink-subtle">No shared reflections.</p>
          )}
        </div>

        <div>
          <h3 className="type-label">Goals</h3>
          {overview.goals.length > 0 ? (
            <ul className="mt-2 layout-stack-sm">
              {overview.goals.map((goal) => (
                <li key={goal.id} className="type-body">
                  {goal.title}{" "}
                  <span className="type-caption capitalize">
                    ({goal.status.toLowerCase().replace("_", " ")})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body mt-2 text-ink-subtle">No goals recorded.</p>
          )}
        </div>
      </div>

      {overview.assessmentTrend.some((a) => a.current !== null) ? (
        <div className="mt-8">
          <h3 className="type-label">Self-assessment trend</h3>
          <ul className="mt-4 layout-stack-sm">
            {overview.assessmentTrend
              .filter((row) => row.current !== null)
              .map((row) => (
                <li key={row.key} className="type-body">
                  {row.label}: {row.starting ?? "—"} → {row.current}
                  {row.inverted ? (
                    <span className="type-caption ml-2">(lower stuck is improvement)</span>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {overview.milestones.some((m) => m.achieved) ? (
        <div className="mt-8">
          <h3 className="type-label">Milestones</h3>
          <ul className="mt-4 layout-stack-sm">
            {overview.milestones
              .filter((m) => m.achieved)
              .map((m) => (
                <li key={m.key} className="type-body">
                  {m.label}
                  {m.achievedAt ? (
                    <span className="type-caption ml-2">
                      · {formatAdminDate(m.achievedAt)}
                    </span>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
