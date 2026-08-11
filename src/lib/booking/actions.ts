"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  BookingPersistenceError,
} from "@/lib/booking/booking-repository";
import { AvailabilityError } from "@/lib/booking/availability/availability-service";
import { sendBookingConfirmationEmails } from "@/lib/email/send-booking-emails";
import { sendCreatePasswordEmail } from "@/lib/email/send-portal-setup-email";
import { ensureClientPortalAccount } from "@/lib/auth/client-repository";
import { parseBookingFormData } from "@/lib/booking/form-data";
import { validateBookingRequest } from "@/lib/booking/validation";
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

    console.info("[booking] saved", { bookingId: booking.id, clientId: booking.clientId });

    await sendBookingConfirmationEmails(booking);

    try {
      const portalAccount = await ensureClientPortalAccount({
        clientId: booking.clientId,
        email: booking.client.email,
      });

      console.info("[portal] provisioning result", {
        bookingId: booking.id,
        clientId: booking.clientId,
        userId: portalAccount?.userId,
        passwordAlreadySet: portalAccount?.passwordAlreadySet ?? null,
        setupTokenCreated: Boolean(portalAccount?.setupToken),
      });

      if (portalAccount?.setupToken) {
        const emailResult = await sendCreatePasswordEmail({
          firstName: booking.client.firstName,
          email: booking.client.email,
          setupToken: portalAccount.setupToken,
          clientId: booking.clientId,
        });

        if (!emailResult.ok) {
          console.warn("[portal] setup email failed after booking", {
            bookingId: booking.id,
            clientId: booking.clientId,
            skipped: Boolean(emailResult.skipped),
            reason: emailResult.reason,
          });
        }
      } else if (portalAccount?.passwordAlreadySet) {
        console.info("[portal] setup email skipped — password already set", {
          bookingId: booking.id,
          clientId: booking.clientId,
          userId: portalAccount.userId,
        });
      } else if (portalAccount) {
        console.warn("[portal] setup email skipped — no setup token returned", {
          bookingId: booking.id,
          clientId: booking.clientId,
          userId: portalAccount.userId,
          passwordAlreadySet: portalAccount.passwordAlreadySet,
        });
      } else {
        console.warn("[portal] setup email skipped — provisioning returned null", {
          bookingId: booking.id,
          clientId: booking.clientId,
        });
      }
    } catch (error) {
      console.error("[portal] provisioning failed after booking", {
        bookingId: booking.id,
        clientId: booking.clientId,
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/payments");
    revalidatePath("/client/dashboard");

    return {
      success: true,
      bookingId: booking.id,
    };
  } catch (error) {
    return { error: mapBookingError(error) };
  }
}

