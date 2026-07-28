import type { BookableService, ServiceId } from "./types";

/** Paid services catalog. Extend this array to add future offerings. */
export const BOOKABLE_SERVICES: BookableService[] = [
  {
    id: "initial-aap-session",
    title: "Initial AAP Session",
    description:
      "A focused session where we identify the emotional pattern maintaining your current reaction and work directly with the nervous system response connected to it.",
    kind: "single-session",
    durationLabel: "90 minutes",
    durationMinutes: 90,
  },
  {
    id: "aap-transformation-package",
    title: "AAP Transformation Package",
    description:
      "A structured process for working with deeper patterns and supporting lasting change over multiple sessions.",
    kind: "package",
  },
];

export function getServiceById(id: ServiceId): BookableService | undefined {
  return BOOKABLE_SERVICES.find((service) => service.id === id);
}

export function getServiceDurationMinutes(id: ServiceId): number {
  return getServiceById(id)?.durationMinutes ?? 90;
}

export const SERVICE_PRICES_CENTS: Record<ServiceId, number> = {
  "initial-aap-session": 18000,
  "aap-transformation-package": 88000,
};

export function getServicePriceCents(id: ServiceId): number {
  return SERVICE_PRICES_CENTS[id];
}
