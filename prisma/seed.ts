import { ensureAvailabilityDefaults } from "../src/lib/booking/availability/config-repository";
import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "../src/lib/admin/client-constants";
import { hashPassword } from "../src/lib/auth/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await ensureAvailabilityDefaults();

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@niksravins.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
  const passwordHash = await hashPassword(adminPassword);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: "Primary Admin",
    },
    update: {
      passwordHash,
      isActive: true,
    },
  });

  const clients = [
    {
      id: "cl_001",
      firstName: "Anna",
      lastName: "Kalniņa",
      email: "anna.k@example.com",
      country: "Latvia",
      timezone: "Europe/Riga",
      firstSessionDate: new Date("2026-05-10T09:00:00.000Z"),
    },
    {
      id: "cl_002",
      firstName: "James",
      lastName: "Whitmore",
      email: "j.whitmore@example.com",
      country: "United Kingdom",
      timezone: "Europe/London",
      firstSessionDate: new Date("2026-07-15T11:00:00.000Z"),
    },
    {
      id: "cl_003",
      firstName: "Sofia",
      lastName: "Marin",
      email: "sofia.m@example.com",
      country: "Germany",
      timezone: "Europe/Berlin",
      firstSessionDate: new Date("2026-04-02T09:00:00.000Z"),
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      create: client,
      update: client,
    });

    await prisma.clientProfile.upsert({
      where: { clientId: client.id },
      create: { clientId: client.id },
      update: {},
    });

    await prisma.reactionAnalysis.upsert({
      where: { clientId: client.id },
      create: { clientId: client.id },
      update: {},
    });

    for (const item of BEFORE_CHECKLIST_ITEMS) {
      await prisma.checklist.upsert({
        where: {
          clientId_type_itemKey: {
            clientId: client.id,
            type: "BEFORE",
            itemKey: item.key,
          },
        },
        create: {
          clientId: client.id,
          type: "BEFORE",
          itemKey: item.key,
        },
        update: {},
      });
    }

    for (const item of CURRENT_CHECKLIST_ITEMS) {
      await prisma.checklist.upsert({
        where: {
          clientId_type_itemKey: {
            clientId: client.id,
            type: "CURRENT",
            itemKey: item.key,
          },
        },
        create: {
          clientId: client.id,
          type: "CURRENT",
          itemKey: item.key,
        },
        update: {},
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
