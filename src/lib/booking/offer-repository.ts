import type { BookableOffer, OfferType } from "@prisma/client";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import type { BookableService, ServiceKind } from "@/lib/booking/types";

export type OfferInput = {
  id: string;
  slug: string;
  title: string;
  description: string;
  detail?: string;
  offerType: OfferType;
  priceCents: number;
  currency?: string;
  durationMinutes?: number;
  durationLabel?: string | null;
  priceLabel?: string | null;
  checkoutNote?: string | null;
  highlights?: string[];
  bonuses?: string[];
  packageSessions?: number | null;
  requiresStartDate?: boolean;
  active?: boolean;
  published?: boolean;
  sortOrder?: number;
};

function offerTypeToKind(offerType: OfferType): ServiceKind {
  switch (offerType) {
    case "PACKAGE":
      return "package";
    case "COURSE":
      return "course";
    default:
      return "single-session";
  }
}

export function mapOfferToBookableService(offer: BookableOffer): BookableService {
  return {
    id: offer.id,
    slug: offer.slug,
    title: offer.title,
    description: offer.description,
    detail: offer.detail || undefined,
    highlights: offer.highlights.length > 0 ? offer.highlights : undefined,
    bonuses: offer.bonuses.length > 0 ? offer.bonuses : undefined,
    checkoutNote: offer.checkoutNote ?? undefined,
    kind: offerTypeToKind(offer.offerType),
    offerType: offer.offerType,
    durationLabel: offer.durationLabel ?? undefined,
    durationMinutes: offer.durationMinutes,
    priceLabel: offer.priceLabel ?? undefined,
    priceCents: offer.priceCents,
    currency: offer.currency,
    packageSessions: offer.packageSessions ?? undefined,
    requiresStartDate: offer.requiresStartDate,
  };
}

export function formatPriceLabel(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === "EUR") {
    return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export async function listPublishedOffers(): Promise<BookableService[]> {
  requireDatabase();
  const offers = await prisma.bookableOffer.findMany({
    where: { active: true, published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return offers.map(mapOfferToBookableService);
}

export async function listAllOffers(): Promise<BookableOffer[]> {
  requireDatabase();
  return prisma.bookableOffer.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getOfferById(id: string): Promise<BookableService | null> {
  requireDatabase();
  const offer = await prisma.bookableOffer.findUnique({ where: { id } });
  return offer ? mapOfferToBookableService(offer) : null;
}

export async function getActiveOfferById(id: string): Promise<BookableService | null> {
  requireDatabase();
  const offer = await prisma.bookableOffer.findFirst({
    where: { id, active: true, published: true },
  });
  return offer ? mapOfferToBookableService(offer) : null;
}

export async function getOfferRecordById(id: string): Promise<BookableOffer | null> {
  requireDatabase();
  return prisma.bookableOffer.findUnique({ where: { id } });
}

export async function getOfferPriceCents(id: string): Promise<number | null> {
  requireDatabase();
  const offer = await prisma.bookableOffer.findUnique({
    where: { id },
    select: { priceCents: true, active: true, published: true },
  });
  if (!offer || !offer.active || !offer.published) return null;
  return offer.priceCents;
}

export async function createOffer(input: OfferInput): Promise<BookableOffer> {
  requireDatabase();
  return prisma.bookableOffer.create({
    data: {
      id: input.id,
      slug: input.slug,
      title: input.title,
      description: input.description,
      detail: input.detail ?? "",
      offerType: input.offerType,
      priceCents: input.priceCents,
      currency: input.currency ?? "EUR",
      durationMinutes: input.durationMinutes ?? 45,
      durationLabel: input.durationLabel ?? null,
      priceLabel: input.priceLabel ?? formatPriceLabel(input.priceCents, input.currency ?? "EUR"),
      checkoutNote: input.checkoutNote ?? null,
      highlights: input.highlights ?? [],
      bonuses: input.bonuses ?? [],
      packageSessions: input.packageSessions ?? null,
      requiresStartDate: input.requiresStartDate ?? false,
      active: input.active ?? true,
      published: input.published ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateOffer(
  id: string,
  input: Partial<Omit<OfferInput, "id">>,
): Promise<BookableOffer> {
  requireDatabase();
  return prisma.bookableOffer.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      detail: input.detail,
      offerType: input.offerType,
      priceCents: input.priceCents,
      currency: input.currency,
      durationMinutes: input.durationMinutes,
      durationLabel: input.durationLabel,
      priceLabel: input.priceLabel,
      checkoutNote: input.checkoutNote,
      highlights: input.highlights,
      bonuses: input.bonuses,
      packageSessions: input.packageSessions,
      requiresStartDate: input.requiresStartDate,
      active: input.active,
      published: input.published,
      sortOrder: input.sortOrder,
    },
  });
}

export function isPackageOffer(service: BookableService): boolean {
  return service.kind === "package";
}

export function isCourseOffer(service: BookableService): boolean {
  return service.kind === "course" || service.requiresStartDate;
}

export async function seedDefaultOffers(): Promise<void> {
  requireDatabase();

  const defaults: OfferInput[] = [
    {
      id: "initial-aap-session",
      slug: "initial-aap-session",
      title: "45-minute Initial Session",
      description:
        "Your first step in the process. Together we explore your patterns and automatic reactions, understand what is maintaining them, and determine the most effective way forward for you.",
      offerType: "SINGLE_SESSION",
      priceCents: 9000,
      durationMinutes: 45,
      durationLabel: "45 minutes",
      priceLabel: "€90",
      sortOrder: 0,
    },
    {
      id: "aap-transformation-package",
      slug: "aap-transformation-package",
      title: "5 × 45-minute Deep Transformation Package",
      description:
        "A structured transformation process — not five separate appointments, but one connected journey designed to create meaningful, lasting change.",
      detail:
        "Meaningful change usually requires more than a single conversation. Working across multiple sessions allows us to go deeper, track what shifts, and build momentum rather than starting from scratch each time.",
      offerType: "PACKAGE",
      priceCents: 45000,
      durationMinutes: 45,
      durationLabel: "5 sessions · 45 minutes each",
      priceLabel: "€450 total",
      checkoutNote:
        "Your first session is confirmed. Schedule your remaining 4 sessions through your Client Portal.",
      highlights: [
        "Deeper understanding of your patterns",
        "Working with underlying reactions",
        "Tracking progress over time",
        "Building lasting change",
        "Consistency and momentum",
      ],
      bonuses: [
        "Personal Reaction Map",
        "Between-session reflection prompts",
        "Priority scheduling",
      ],
      packageSessions: 5,
      sortOrder: 1,
    },
  ];

  for (const offer of defaults) {
    await prisma.bookableOffer.upsert({
      where: { id: offer.id },
      create: {
        id: offer.id,
        slug: offer.slug,
        title: offer.title,
        description: offer.description,
        detail: offer.detail ?? "",
        offerType: offer.offerType,
        priceCents: offer.priceCents,
        currency: offer.currency ?? "EUR",
        durationMinutes: offer.durationMinutes ?? 45,
        durationLabel: offer.durationLabel ?? null,
        priceLabel: offer.priceLabel ?? null,
        checkoutNote: offer.checkoutNote ?? null,
        highlights: offer.highlights ?? [],
        bonuses: offer.bonuses ?? [],
        packageSessions: offer.packageSessions ?? null,
        requiresStartDate: offer.requiresStartDate ?? false,
        active: true,
        published: true,
        sortOrder: offer.sortOrder ?? 0,
      },
      update: {
        slug: offer.slug,
        title: offer.title,
        description: offer.description,
        detail: offer.detail ?? "",
        offerType: offer.offerType,
        priceCents: offer.priceCents,
        durationMinutes: offer.durationMinutes ?? 45,
        durationLabel: offer.durationLabel ?? null,
        priceLabel: offer.priceLabel ?? null,
        checkoutNote: offer.checkoutNote ?? null,
        highlights: offer.highlights ?? [],
        bonuses: offer.bonuses ?? [],
        packageSessions: offer.packageSessions ?? null,
        sortOrder: offer.sortOrder ?? 0,
      },
    });
  }
}
