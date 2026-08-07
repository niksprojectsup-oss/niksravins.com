"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  BookingPersistenceError,
} from "@/lib/booking/booking-repository";
import {
  AvailabilityError,
  getAvailableSlots,
} from "@/lib/booking/availability/availability-service";
import { sendBookingConfirmationEmails } from "@/lib/email/send-booking-emails";
import { parseBookingFormData } from "@/lib/booking/form-data";
import { validateBookingRequest } from "@/lib/booking/validation";
import type { AvailabilityDay, ServiceId } from "@/lib/booking/types";
import { Prisma } from "@prisma/client";

export type BookingFormState = {
  error?: string;
  success?: boolean;
  bookingId?: string;
};

function mapBookingError(error: unknown): string {
  if (error instanceof BookingPersistenceError || error instanceof AvailabilityError) {
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

export async function submitBookingFormAction(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const request = parseBookingFormData(formData);

  const validationError = validateBookingRequest(request);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const booking = await createBooking(request);

    await sendBookingConfirmationEmails(booking);

    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/payments");

    return {
      success: true,
      bookingId: booking.id,
    };
  } catch (error) {
    return { error: mapBookingError(error) };
  }
}

export async function getAvailabilityAction(
  serviceId: ServiceId,
  displayTimezone: string,
): Promise<AvailabilityDay[]> {
  return getAvailableSlots(serviceId, displayTimezone);
}
