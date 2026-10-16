import type { BookingOfferCopy } from "@/content/i18n/types";
import type { BookableService } from "@/lib/booking/types";

export function applyOfferTranslations(
  offers: BookableService[],
  translations: Record<string, BookingOfferCopy>,
): BookableService[] {
  return offers.map((offer) => localizeOffer(offer, translations));
}

export function localizeOffer(
  offer: BookableService,
  translations: Record<string, BookingOfferCopy>,
): BookableService {
  const copy = translations[offer.id];
  if (!copy) return offer;

  return {
    ...offer,
    title: copy.title || offer.title,
    description: copy.description || offer.description,
    detail: copy.detail ?? offer.detail,
    durationLabel: copy.durationLabel ?? offer.durationLabel,
    priceLabel: copy.priceLabel ?? offer.priceLabel,
    checkoutNote: copy.checkoutNote ?? offer.checkoutNote,
    highlights: copy.highlights ? [...copy.highlights] : offer.highlights,
    bonuses: copy.bonuses ? [...copy.bonuses] : offer.bonuses,
  };
}
