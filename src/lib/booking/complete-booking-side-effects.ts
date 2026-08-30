"use server";

import { revalidatePath } from "next/cache";
import type { BookingRecord } from "@/lib/booking/types";
import { sendBookingConfirmationEmails } from "@/lib/email/send-booking-emails";
import { sendCreatePasswordEmail } from "@/lib/email/send-portal-setup-email";
import { ensureClientPortalAccount } from "@/lib/auth/client-repository";

export async function completeBookingSideEffects(booking: BookingRecord): Promise<void> {
  await sendBookingConfirmationEmails(booking);

  try {
    const portalAccount = await ensureClientPortalAccount({
      clientId: booking.clientId,
      email: booking.client.email,
    });

    if (portalAccount?.setupToken) {
      await sendCreatePasswordEmail({
        firstName: booking.client.firstName,
        email: booking.client.email,
        setupToken: portalAccount.setupToken,
        clientId: booking.clientId,
      });
    }
  } catch (error) {
    console.error("[portal] provisioning failed after booking", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/sessions");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/packages");
  revalidatePath("/client/dashboard");
}
