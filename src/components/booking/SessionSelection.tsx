import { bookingContent } from "@/content/booking";
import type { SessionType } from "@/lib/booking/types";
import { BookingPanel, SessionCard } from "./BookingPanel";

type SessionSelectionProps = {
  selected: SessionType | null;
  onSelect: (type: SessionType) => void;
};

export function SessionSelection({ selected, onSelect }: SessionSelectionProps) {
  const { initial, followUp } = bookingContent.sessions;

  return (
    <BookingPanel title="Select a session">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <SessionCard
          title={initial.title}
          description={initial.description}
          duration={initial.duration}
          selected={selected === "initial"}
          onSelect={() => onSelect("initial")}
        />
        <SessionCard
          title={followUp.title}
          description={followUp.description}
          duration={followUp.duration}
          selected={selected === "follow-up"}
          onSelect={() => onSelect("follow-up")}
        />
      </div>
    </BookingPanel>
  );
}
