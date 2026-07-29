"use server";

import { revalidatePath } from "next/cache";
import { createBooking, BookingPersistenceError } from "@/lib/booking/booking-repository";
import { validateBookingRequest } from "@/lib/booking/validation";
import type { BookingRecord, BookingRequest } from "@/lib/booking/types";
import { Prisma } from "@prisma/client";

function mapBookingError(error: unknown): string {
  if (error instanceof BookingPersistenceError) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A record with this email already exists with conflicting data.";
    }
    if (error.code === "P2021") {
      return "Database schema is out of date. Run npm run db:push.";
    }
  }

  console.error("Booking failed:", error);
  return "Unable to complete your booking. Please try again.";
}

export async function createBookingAction(
  request: BookingRequest,
): Promise<{ success: true; booking: BookingRecord } | { success: false; error: string }> {
  const validationError = validateBookingRequest(request);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const booking = await createBooking(request);
    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/payments");
    return { success: true, booking };
  } catch (error) {
    return { success: false, error: mapBookingError(error) };
  }
}
