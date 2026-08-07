"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  createPackageFollowUpSession,
  BookingPersistenceError,
  lookupPackageFollowUpEligibility,
} from "@/lib/booking/booking-repository";
import {
  AvailabilityError,
  getAvailableSlots,
} from "@/lib/booking/availability/availability-service";
import { parseBookingFormData } from "@/lib/booking/form-data";
import { validateBookingRequest } from "@/lib/booking/validation";
import type { AvailabilityDay, ServiceId } from "@/lib/booking/types";
import { Prisma } from "@prisma/client";

export type BookingFormState = {
  error?: string;
  success?: boolean;
  bookingId?: string;
};

export type PackageFollowUpFormState = {
  error?: string;
  success?: boolean;
  sessionNumber?: number;
};

export type PackageFollowUpEligibilityState = {
  eligible: boolean;
  completedSessions?: number;
  remainingSessions?: number;
  totalSessions?: number;
  nextSessionNumber?: number;
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

export async function getPackageFollowUpEligibilityAction(
  email: string,
): Promise<PackageFollowUpEligibilityState> {
  const eligibility = await lookupPackageFollowUpEligibility(email);
  if (!eligibility) {
    return { eligible: false };
  }

  return {
    eligible: true,
    completedSessions: eligibility.completedSessions,
    remainingSessions: eligibility.remainingSessions,
    totalSessions: eligibility.totalSessions,
    nextSessionNumber: eligibility.nextSessionNumber,
  };
}

export async function submitPackageFollowUpAction(
  _prevState: PackageFollowUpFormState,
  formData: FormData,
): Promise<PackageFollowUpFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const slotId = String(formData.get("slotId") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Europe/Riga").trim();
  const sessionIntention = String(formData.get("sessionIntention") ?? "").trim();

  if (!email || !slotId || !scheduledAt) {
    return { error: "Please complete all required booking details." };
  }

  try {
    const result = await createPackageFollowUpSession({
      email,
      slotId,
      scheduledAt,
      timezone,
      sessionIntention,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/calendar");

    return {
      success: true,
      sessionNumber: result.sessionNumber,
    };
  } catch (error) {
    if (error instanceof BookingPersistenceError || error instanceof AvailabilityError) {
      return { error: error.message };
    }

    console.error("Package follow-up booking failed:", error);
    return { error: "Unable to schedule your next session. Please try again." };
  }
}
