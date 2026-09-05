import type { BookingUiContent } from "@/content/i18n/types";
import type { BookableService } from "@/lib/booking/types";
import { BookingPanel, SessionCard } from "./BookingPanel";

type SessionSelectionProps = {
  offers: BookableService[];
  selected: string | null;
  onSelect: (id: string) => void;
  labels: BookingUiContent;
};

export function SessionSelection({
  offers,
  selected,
  onSelect,
  labels,
}: SessionSelectionProps) {
  return (
    <BookingPanel
      title={labels.services.title}
      description={labels.services.description}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {offers.map((service) => (
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
            chooseLabel={labels.services.choose}
            selectedLabel={labels.services.selected}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </div>
    </BookingPanel>
  );
}
