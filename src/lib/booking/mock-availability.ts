import type { AvailabilityDay } from "@/lib/booking/types";
import {
  formatSlotDate,
  formatSlotTime,
} from "@/lib/booking/timezone";

export { formatSlotDate, formatSlotTime };

export function findSlotById(
  availability: AvailabilityDay[],
  slotId: string,
) {
  for (const day of availability) {
    const slot = day.slots.find((entry) => entry.id === slotId);
    if (slot) return slot;
  }
  return undefined;
}
