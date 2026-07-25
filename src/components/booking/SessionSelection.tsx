import { bookingContent } from "@/content/booking";
import { BOOKABLE_SERVICES } from "@/lib/booking/services-catalog";
import type { ServiceId } from "@/lib/booking/types";
import { BookingPanel, SessionCard } from "./BookingPanel";

type SessionSelectionProps = {
  selected: ServiceId | null;
  onSelect: (id: ServiceId) => void;
};

export function SessionSelection({ selected, onSelect }: SessionSelectionProps) {
  return (
    <BookingPanel
      title={bookingContent.services.title}
      description={bookingContent.services.description}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {BOOKABLE_SERVICES.map((service) => (
          <SessionCard
            key={service.id}
            title={service.title}
            description={service.description}
            duration={service.durationLabel}
            selected={selected === service.id}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </div>
    </BookingPanel>
  );
}
