import type { BookableService, ServiceId } from "./types";

/** Paid services catalog. Extend this array to add future offerings. */
export const BOOKABLE_SERVICES: BookableService[] = [
  {
    id: "initial-aap-session",
    title: "45-minute Initial Session",
    description:
      "Your first step in the process. Together we explore your patterns and automatic reactions, understand what is maintaining them, and determine the most effective way forward for you.",
    kind: "single-session",
    durationLabel: "45 minutes",
    durationMinutes: 45,
    priceLabel: "€90",
  },
  {
    id: "aap-transformation-package",
    title: "5 × 45-minute Deep Transformation Package",
    description:
      "A structured transformation process — not five separate appointments, but one connected journey designed to create meaningful, lasting change.",
    detail:
      "Meaningful change usually requires more than a single conversation. Working across multiple sessions allows us to go deeper, track what shifts, and build momentum rather than starting from scratch each time.",
    kind: "package",
    durationLabel: "5 sessions · 45 minutes each",
    durationMinutes: 45,
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
  },
];

export const PACKAGE_TOTAL_SESSIONS = 5;

export function getServiceById(id: ServiceId): BookableService | undefined {
  return BOOKABLE_SERVICES.find((service) => service.id === id);
}

export function getServiceDurationMinutes(id: ServiceId): number {
  return getServiceById(id)?.durationMinutes ?? 45;
}

export const SERVICE_PRICES_CENTS: Record<ServiceId, number> = {
  "initial-aap-session": 9000,
  "aap-transformation-package": 45000,
};

export function getServicePriceCents(id: ServiceId): number {
  return SERVICE_PRICES_CENTS[id];
}

export function isPackageService(id: ServiceId): boolean {
  return getServiceById(id)?.kind === "package";
}
