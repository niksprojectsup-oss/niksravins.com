"use server";

import { revalidatePath } from "next/cache";
import {
  PackageOperationError,
  schedulePackageSession,
} from "@/lib/admin/package-repository";
import { getServerSession } from "@/lib/auth/session";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { sendPackageSessionConfirmationEmail } from "@/lib/email/send-package-session-email";
import { prisma, requireDatabase } from "@/lib/db/prisma";

export type PackageSessionBookingState = {
  error?: string;
  success?: boolean;
};

async function requireClientForAction(): Promise<{ clientId: string }> {
  const session = await getServerSession();
  if (!session || session.role !== "CLIENT" || !session.clientId) {
    throw new PackageOperationError("You must be signed in to book a session.");
  }

  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) {
    throw new PackageOperationError("Your session has expired. Please sign in again.");
  }

  return { clientId: session.clientId };
}

export async function bookPackageSessionAction(
  packageId: string,
  slotId: string,
  scheduledAt: string,
  displayTimezone: string,
): Promise<PackageSessionBookingState> {
  try {
    const { clientId } = await requireClientForAction();
    requireDatabase();

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        firstName: true,
        email: true,
        timezone: true,
      },
    });

    if (!client) {
      return { error: "Client profile not found." };
    }

    console.info("[portal] package session booking attempted", {
      clientId,
      packageId,
    });

    const result = await schedulePackageSession(packageId, scheduledAt, {
      clientId,
      displayTimezone: displayTimezone || client.timezone,
      slotId,
    });

    await sendPackageSessionConfirmationEmail({
      clientFirstName: client.firstName,
      clientEmail: client.email,
      clientTimezone: displayTimezone || client.timezone,
      sessionNumber: result.sessionNumber,
      totalSessions: 5,
      scheduledAt,
      packageId,
      sessionId: result.sessionId,
    });

    console.info("[portal] package session booked", {
      clientId,
      packageId,
      sessionId: result.sessionId,
      sessionNumber: result.sessionNumber,
    });

    revalidatePath("/client/dashboard");
    revalidatePath(`/client/packages/${packageId}/book`);
    revalidatePath("/admin");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/sessions");

    return { success: true };
  } catch (error) {
    if (error instanceof PackageOperationError) {
      console.warn("[portal] package session booking rejected", {
        packageId,
        message: error.message,
      });
      return { error: error.message };
    }

    console.error("[portal] package session booking failed", {
      packageId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { error: "Unable to book this session. Please try again." };
  }
}
