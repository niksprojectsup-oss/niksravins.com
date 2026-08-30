import { validateBookableSlot } from "@/lib/booking/availability/availability-service";
import { initializeClientWorkspace } from "@/lib/admin/client-workspace";
import { prisma, requireDatabase } from "@/lib/db/prisma";
import {
  getActiveOfferById,
  getOfferPriceCents,
  isCourseOffer,
  isPackageOffer,
} from "@/lib/booking/offer-repository";
import type { BookingRecord, BookingRequest } from "@/lib/booking/types";
import { DEFAULT_PACKAGE_SESSIONS } from "@/lib/booking/types";

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

function parseCourseStartDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function createBooking(
  request: BookingRequest,
): Promise<BookingRecord> {
  requireDatabase();

  const service = await getActiveOfferById(request.serviceId);
  if (!service) {
    throw new BookingPersistenceError("Selected service is not available.");
  }

  const normalizedEmail = request.client.email.trim().toLowerCase();
  const isPackage = isPackageOffer(service);
  const isCourse = isCourseOffer(service);
  const courseStartDate = parseCourseStartDate(request.courseStartDate);
  const scheduledAt = new Date(request.scheduledAt);

  if (isCourse) {
    if (!courseStartDate) {
      throw new BookingPersistenceError("Please select a course start date.");
    }
    if (courseStartDate.getTime() <= Date.now()) {
      throw new BookingPersistenceError("Please select a future start date.");
    }
  } else {
    await validateBookableSlot({
      serviceId: request.serviceId,
      slotId: request.slotId,
      scheduledAt: request.scheduledAt,
      displayTimezone: request.client.timezone,
    });
  }

  const amountCents = await getOfferPriceCents(request.serviceId);
  if (amountCents === null) {
    throw new BookingPersistenceError("Selected service is not available.");
  }

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
          firstSessionDate: isCourse && courseStartDate ? courseStartDate : scheduledAt,
        },
      });

      await initializeClientWorkspace(tx, client.id);
    } else {
      const merged = mergeClientFields(
        client,
        request.client,
        isCourse && courseStartDate ? courseStartDate : scheduledAt,
      );

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
      const activePackage = await tx.sessionPackage.findFirst({
        where: {
          clientId: client.id,
          serviceId: request.serviceId,
          status: "ACTIVE",
        },
      });

      if (activePackage) {
        throw new BookingPersistenceError(
          "You already have an active transformation package. Schedule remaining sessions in your Client Portal.",
        );
      }

      const sessionPackage = await tx.sessionPackage.create({
        data: {
          clientId: client.id,
          serviceId: request.serviceId,
          totalSessions: service.packageSessions ?? DEFAULT_PACKAGE_SESSIONS,
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
        scheduledAt: isCourse && courseStartDate ? courseStartDate : scheduledAt,
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
        courseStartDate: isCourse ? courseStartDate : null,
        status: "CONFIRMED",
      },
    });

    await tx.payment.create({
      data: {
        clientId: client.id,
        sessionId: isPackage ? null : session.id,
        packageId,
        amountCents,
        currency: service.currency,
        status: "PENDING",
        provider: "stripe",
      },
    });

    return { booking, client, session, packageId };
  });

  return {
    id: result.booking.id,
    clientId: result.client.id,
    serviceId: request.serviceId,
    slotId: request.slotId,
    scheduledAt: request.scheduledAt,
    courseStartDate: request.courseStartDate ?? null,
    client: request.client,
    status: "confirmed",
    paymentStatus: "pending",
    paymentProvider: "stripe",
    createdAt: result.booking.createdAt.toISOString(),
    updatedAt: result.booking.updatedAt.toISOString(),
  };
}
