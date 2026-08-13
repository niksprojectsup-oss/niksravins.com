import type { BookingUiContent } from "@/content/i18n/types";
import { BOOKABLE_SERVICES } from "@/lib/booking/services-catalog";
import type { ServiceId } from "@/lib/booking/types";
import { BookingPanel, SessionCard } from "./BookingPanel";

type SessionSelectionProps = {
  selected: ServiceId | null;
  onSelect: (id: ServiceId) => void;
  labels: BookingUiContent;
};

export function SessionSelection({ selected, onSelect, labels }: SessionSelectionProps) {
  return (
    <BookingPanel
      title={labels.services.title}
      description={labels.services.description}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {BOOKABLE_SERVICES.map((service) => (
          <SessionCard
            key={service.id}
            title={service.title}
            description={service.description}
            detail={service.detail}
            highlights={service.highlights}
            bonuses={service.bonuses}
            duration={service.durationLabel}
            priceLabel={service.priceLabel}
            selected={selected === service.id}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </div>
    </BookingPanel>
  );
}
