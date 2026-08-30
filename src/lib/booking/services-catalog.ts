import type { BookableService } from "./types";
import {
  getActiveOfferById,
  getOfferById,
  getOfferPriceCents,
  isPackageOffer,
  listPublishedOffers,
  seedDefaultOffers,
} from "./offer-repository";
import { DEFAULT_PACKAGE_SESSIONS, LEGACY_SERVICE_IDS } from "./types";

export { LEGACY_SERVICE_IDS, DEFAULT_PACKAGE_SESSIONS as PACKAGE_TOTAL_SESSIONS };

/** @deprecated Use listPublishedOffers() — loads from database. */
export async function getBookableServices(): Promise<BookableService[]> {
  return listPublishedOffers();
}

export async function getServiceById(id: string): Promise<BookableService | undefined> {
  const offer = await getOfferById(id);
  return offer ?? undefined;
}

export async function getActiveServiceById(
  id: string,
): Promise<BookableService | undefined> {
  const offer = await getActiveOfferById(id);
  return offer ?? undefined;
}

export async function getServiceDurationMinutes(id: string): Promise<number> {
  const service = await getOfferById(id);
  return service?.durationMinutes ?? 45;
}

export async function getServicePriceCents(id: string): Promise<number> {
  const price = await getOfferPriceCents(id);
  if (price === null) {
    throw new Error(`Offer not found or unavailable: ${id}`);
  }
  return price;
}

export function isPackageService(service: BookableService): boolean {
  return isPackageOffer(service);
}

export async function ensureDefaultOffersSeeded(): Promise<void> {
  await seedDefaultOffers();
}
