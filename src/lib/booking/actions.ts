"use server";

import { revalidatePath } from "next/cache";
import { createBooking, BookingPersistenceError } from "@/lib/booking/booking-repository";
import type { BookingRecord, BookingRequest } from "@/lib/booking/types";

export async function createBookingAction(
  request: BookingRequest,
): Promise<{ success: true; booking: BookingRecord } | { success: false; error: string }> {
  try {
    const booking = await createBooking(request);
    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/calendar");
    return { success: true, booking };
  } catch (error) {
    if (error instanceof BookingPersistenceError) {
      return { success: false, error: error.message };
    }

    console.error("Booking failed:", error);
    return {
      success: false,
      error: "Unable to complete your booking. Please try again.",
    };
  }
}
