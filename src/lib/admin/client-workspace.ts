import {
  BEFORE_CHECKLIST_ITEMS,
  CURRENT_CHECKLIST_ITEMS,
} from "@/lib/admin/client-constants";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function initializeClientWorkspace(
  tx: Prisma.TransactionClient,
  clientId: string,
): Promise<void> {
  await tx.clientProfile.create({
    data: { clientId },
  });

  await tx.reactionAnalysis.create({
    data: { clientId },
  });

  for (const item of BEFORE_CHECKLIST_ITEMS) {
    await tx.checklist.create({
      data: {
        clientId,
        type: "BEFORE",
        itemKey: item.key,
      },
    });
  }

  for (const item of CURRENT_CHECKLIST_ITEMS) {
    await tx.checklist.create({
      data: {
        clientId,
        type: "CURRENT",
        itemKey: item.key,
      },
    });
  }
}

export async function ensureClientWorkspace(clientId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  await prisma.$transaction(async (tx) => {
    const profile = await tx.clientProfile.findUnique({ where: { clientId } });
    if (!profile) {
      await initializeClientWorkspace(tx, clientId);
    }
  });
}
