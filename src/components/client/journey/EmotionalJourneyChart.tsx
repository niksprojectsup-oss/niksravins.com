import { CHECK_IN_MOODS } from "@/lib/journey/constants";
import type { JourneyCheckIn } from "@/lib/journey/journey-repository";

export function EmotionalJourneyChart({ checkIns }: { checkIns: JourneyCheckIn[] }) {
  if (checkIns.length === 0) {
    return (
      <div className="observed-card p-6 md:p-8">
        <p className="type-body text-ink-subtle">
          Your self-reflection over time will appear here as you save check-ins.
        </p>
      </div>
    );
  }

  const maxIntensity = 10;

  return (
    <div className="observed-card p-6 md:p-8">
      <h2 className="type-heading-sm">Your self-reflection over time</h2>
      <p className="type-caption mt-2">
        Emotional intensity and moods from your check-ins — personal reflection, not clinical diagnosis.
      </p>

      <div className="mt-8 flex items-end gap-1 overflow-x-auto pb-2" aria-hidden>
        {checkIns.map((checkIn) => {
          const height = (checkIn.intensity / maxIntensity) * 100;
          const moodLabel =
            CHECK_IN_MOODS.find((m) => m.key === checkIn.mood)?.label ?? checkIn.mood;
          return (
            <div
              key={checkIn.id}
              className="flex min-w-[2rem] flex-1 flex-col items-center gap-2"
              title={`${checkIn.checkInDate}: ${moodLabel}, ${checkIn.intensity}/10`}
            >
              <div
                className="w-full max-w-[2rem] rounded-t bg-accent/60"
                style={{ height: `${Math.max(height, 8)}%`, minHeight: "0.5rem" }}
              />
              <span className="type-caption text-[0.65rem] text-ink-faint">
                {checkIn.checkInDate.slice(5)}
              </span>
            </div>
          );
        })}
      </div>

      <ul className="mt-8 layout-stack-md">
        {checkIns
          .slice()
          .reverse()
          .slice(0, 8)
          .map((checkIn) => (
            <li key={checkIn.id} className="border-t border-border-subtle pt-4 first:border-t-0 first:pt-0">
              <p className="type-caption">{checkIn.checkInDate}</p>
              <p className="type-body mt-1">
                {CHECK_IN_MOODS.find((m) => m.key === checkIn.mood)?.label} · intensity{" "}
                {checkIn.intensity}/10
              </p>
              {checkIn.emotionTags.length > 0 ? (
                <p className="type-caption mt-1">{checkIn.emotionTags.join(", ")}</p>
              ) : null}
            </li>
          ))}
      </ul>
    </div>
  );
}
