import { initializeClientWorkspace } from "@/lib/admin/client-workspace";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import {
  getServiceById,
  getServicePriceCents,
  isPackageService,
  PACKAGE_TOTAL_SESSIONS,
} from "@/lib/booking/services-catalog";
import type { BookingRecord, BookingRequest } from "@/lib/booking/types";

export class BookingPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingPersistenceError";
  }
}

function normalizePhone(phone?: string): string | null {
  const trimmed = phone?.trim();
  return trimmed ? trimmed : null;
}

function mergeClientFields(
  existing: {
    firstName: string;
    lastName: string;
    phone: string | null;
    country: string;
    timezone: string;
    firstSessionDate: Date | null;
  },
  incoming: BookingRequest["client"],
  scheduledAt: Date,
) {
  const phone = normalizePhone(incoming.phone) ?? existing.phone;

  return {
    firstName: incoming.firstName.trim() || existing.firstName,
    lastName: incoming.lastName.trim() || existing.lastName,
    phone,
    country: incoming.country.trim() || existing.country,
    timezone: incoming.timezone.trim() || existing.timezone,
    firstSessionDate: existing.firstSessionDate ?? scheduledAt,
  };
}

export async function createBooking(
  request: BookingRequest,
): Promise<BookingRecord> {
  requireDatabase();

  const service = getServiceById(request.serviceId);
  if (!service) {
    throw new BookingPersistenceError("Selected service is not available.");
  }

  const normalizedEmail = request.client.email.trim().toLowerCase();
  const scheduledAt = new Date(request.scheduledAt);
  const isPackage = isPackageService(request.serviceId);

  const result = await prisma.$transaction(async (tx) => {
    let client = await tx.client.findUnique({
      where: { email: normalizedEmail },
    });

    if (!client) {
      client = await tx.client.create({
        data: {
          firstName: request.client.firstName.trim(),
          lastName: request.client.lastName.trim(),
          email: normalizedEmail,
          phone: normalizePhone(request.client.phone),
          country: request.client.country,
          timezone: request.client.timezone,
          firstSessionDate: scheduledAt,
        },
      });

      await initializeClientWorkspace(tx, client.id);
    } else {
      const merged = mergeClientFields(client, request.client, scheduledAt);

      client = await tx.client.update({
        where: { id: client.id },
        data: merged,
      });

      const profile = await tx.clientProfile.findUnique({
        where: { clientId: client.id },
      });
      if (!profile) {
        await initializeClientWorkspace(tx, client.id);
      }
    }

    let packageId: string | undefined;

    if (isPackage) {
      const sessionPackage = await tx.sessionPackage.create({
        data: {
          clientId: client.id,
          serviceId: request.serviceId,
          totalSessions: PACKAGE_TOTAL_SESSIONS,
          completedSessions: 0,
        },
      });
      packageId = sessionPackage.id;
    }

    const session = await tx.session.create({
      data: {
        clientId: client.id,
        packageId,
        sessionNumber: isPackage ? 1 : null,
        scheduledAt,
        sessionType: service.title,
        serviceId: request.serviceId,
        status: "SCHEDULED",
        mainTopic: request.client.sessionIntention.trim(),
      },
    });

    const booking = await tx.booking.create({
      data: {
        clientId: client.id,
        sessionId: session.id,
        packageId,
        serviceId: request.serviceId,
        slotId: request.slotId,
        sessionIntention: request.client.sessionIntention.trim(),
        status: "CONFIRMED",
      },
    });

    await tx.payment.create({
      data: {
        clientId: client.id,
        sessionId: isPackage ? null : session.id,
        packageId,
        amountCents: getServicePriceCents(request.serviceId),
        status: "PENDING",
      },
    });

    return { booking, client, session, packageId };
  });

  return {
    id: result.booking.id,
    serviceId: request.serviceId,
    slotId: request.slotId,
    scheduledAt: request.scheduledAt,
    client: request.client,
    status: "confirmed",
    paymentStatus: "pending",
    createdAt: result.booking.createdAt.toISOString(),
    updatedAt: result.booking.updatedAt.toISOString(),
  };
}
