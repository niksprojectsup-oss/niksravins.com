"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/security/audit";
import { isLatvianBookingEnabled } from "@/lib/booking/feature-flags";

export async function getLatvianBookingFlagAction() {
  await requireAdmin();
  return isLatvianBookingEnabled();
}

export async function setLatvianBookingFlagAction(enabled: boolean) {
  const session = await requireAdmin();

  await prisma.bookingSettings.upsert({
    where: { id: "default" },
    update: { latvianBookingEnabled: enabled },
    create: { id: "default", latvianBookingEnabled: enabled },
  });

  await logAuditEvent({
    action: "settings.latvian_booking.update",
    resource: "booking_settings",
    resourceId: "default",
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/lv/book");
  return { success: true as const };
}
