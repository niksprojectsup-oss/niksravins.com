"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getAvailabilityConfig,
  updateAvailabilityConfig,
  type AvailabilitySettingsInput,
  type DailyTimeBlockInput,
  type WeeklyAvailabilityInput,
} from "@/lib/booking/availability/config-repository";
import { logAuditEvent } from "@/lib/security/audit";

export async function getAvailabilitySettingsAction() {
  await requireAdmin();
  return getAvailabilityConfig();
}

export async function saveAvailabilitySettingsAction(input: {
  settings: AvailabilitySettingsInput;
  weekly: WeeklyAvailabilityInput[];
  blocks: DailyTimeBlockInput[];
}) {
  const session = await requireAdmin();
  await updateAvailabilityConfig(input);

  await logAuditEvent({
    action: "availability.update",
    resource: "booking_settings",
    resourceId: "default",
    actorAdminId: session.id,
    actorRole: session.role,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { success: true as const };
}
