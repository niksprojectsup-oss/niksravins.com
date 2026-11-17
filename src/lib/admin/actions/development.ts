"use server";

import { revalidatePath } from "next/cache";
import { requireClientAccess } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/security/audit";

type ActionResult = { ok: true } | { ok: false; error: string };

function err(e: unknown): ActionResult {
  console.error("[development]", e);
  return { ok: false, error: e instanceof Error ? e.message : "Darbība neizdevās." };
}

async function audit(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  data: {
    clientId: string; trunkId?: string | null; branchId?: string | null;
    action: string; prevStatus?: string | null; newStatus?: string | null;
    detail?: string; actorAdminId?: string | null;
  },
) {
  await tx.clientDevelopmentEvent.create({ data });
}

// ─── Stumbra pievienošana no kartotēkas ─────────────────────────────

export async function addTrunkFromLibrary(input: {
  clientId: string;
  libraryTrunkId: string;
  beliefId?: string | null;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.$transaction(async (tx) => {
      const lib = await tx.beliefLibraryTrunk.findUnique({
        where: { id: input.libraryTrunkId },
        include: { branches: { orderBy: { sortOrder: "asc" } } },
      });
      if (!lib) throw new Error("Kartotēkas stumbrs nav atrasts.");

      const existing = await tx.clientDevelopmentTrunk.findFirst({
        where: { clientId: input.clientId, libraryTrunkId: lib.id },
      });
      if (existing) throw new Error(`Stumbrs ${lib.libraryKey} jau ir klienta darba plānā.`);

      const maxSort = await tx.clientDevelopmentTrunk.aggregate({
        where: { clientId: input.clientId }, _max: { sortOrder: true },
      });
      const trunk = await tx.clientDevelopmentTrunk.create({
        data: {
          clientId: input.clientId,
          libraryTrunkId: lib.id,
          beliefId: input.beliefId ?? null,
          beliefIds: input.beliefId ? [input.beliefId] : [],
          origin: "LIBRARY",
          titleLv: lib.titleLv,
          titleEn: lib.titleEn,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });
      await tx.clientDevelopmentBranch.createMany({
        data: lib.branches.map((b) => ({
          clientTrunkId: trunk.id,
          libraryBranchId: b.id,
          textLv: b.textLv,
          textEn: b.textEn,
          sortOrder: b.sortOrder,
        })),
      });
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, action: "TRUNK_ADDED",
        newStatus: "NOT_STARTED", detail: `Pievienots no kartotēkas ${lib.libraryKey}`,
        actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

export async function addCustomTrunk(input: {
  clientId: string; titleLv: string; titleEn?: string; beliefId?: string | null;
  branches: { textLv: string; textEn?: string }[];
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  if (!input.titleLv.trim()) return { ok: false, error: "Stumbra formulējums ir obligāts." };
  try {
    await prisma.$transaction(async (tx) => {
      const maxSort = await tx.clientDevelopmentTrunk.aggregate({
        where: { clientId: input.clientId }, _max: { sortOrder: true },
      });
      const trunk = await tx.clientDevelopmentTrunk.create({
        data: {
          clientId: input.clientId,
          beliefId: input.beliefId ?? null,
          beliefIds: input.beliefId ? [input.beliefId] : [],
          origin: "CUSTOM",
          titleLv: input.titleLv.trim(),
          titleEn: input.titleEn?.trim() ?? "",
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });
      await tx.clientDevelopmentBranch.createMany({
        data: input.branches
          .filter((b) => b.textLv.trim())
          .map((b, i) => ({
            clientTrunkId: trunk.id,
            textLv: b.textLv.trim(),
            textEn: b.textEn?.trim() ?? "",
            sortOrder: i + 1,
          })),
      });
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, action: "TRUNK_ADDED",
        newStatus: "NOT_STARTED", detail: "Individuāli izveidots stumbrs",
        actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

// ─── Zaru izstrāde ──────────────────────────────────────────────────

export async function setBranchDone(input: {
  clientId: string; branchId: string; done: boolean;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.$transaction(async (tx) => {
      const branch = await tx.clientDevelopmentBranch.findUnique({
        where: { id: input.branchId }, include: { clientTrunk: true },
      });
      if (!branch || branch.clientTrunk.clientId !== input.clientId) {
        throw new Error("Zars nav atrasts šim klientam.");
      }
      const trunk = branch.clientTrunk;
      if (trunk.status === "COMPLETED" && !input.done) {
        throw new Error("Pabeigtam stumbram zaru nevar atzīmēt atpakaļ - izmanto pārpārbaudi.");
      }
      await tx.clientDevelopmentBranch.update({
        where: { id: branch.id },
        data: {
          done: input.done,
          doneAt: input.done ? new Date() : null,
          doneByAdminId: input.done ? session.id : null,
          doneSessionId: input.done ? (trunk.sessionId ?? null) : null,
        },
      });
      const newStatus = trunk.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
      if (trunk.status !== newStatus) {
        await tx.clientDevelopmentTrunk.update({
          where: { id: trunk.id }, data: { status: newStatus },
        });
      }
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, branchId: branch.id,
        action: input.done ? "BRANCH_DONE" : "BRANCH_UNDONE",
        prevStatus: trunk.status, newStatus,
        detail: branch.textLv.slice(0, 120), actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

export async function addBranchToTrunk(input: {
  clientId: string; clientTrunkId: string; textLv: string; textEn?: string;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  if (!input.textLv.trim()) return { ok: false, error: "Zara formulējums ir obligāts." };
  try {
    await prisma.$transaction(async (tx) => {
      const trunk = await tx.clientDevelopmentTrunk.findUnique({
        where: { id: input.clientTrunkId },
      });
      if (!trunk || trunk.clientId !== input.clientId) throw new Error("Stumbrs nav atrasts.");
      const maxSort = await tx.clientDevelopmentBranch.aggregate({
        where: { clientTrunkId: trunk.id }, _max: { sortOrder: true },
      });
      const branch = await tx.clientDevelopmentBranch.create({
        data: {
          clientTrunkId: trunk.id,
          textLv: input.textLv.trim(),
          textEn: input.textEn?.trim() ?? "",
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });
      // Pabeigts stumbrs + jauns zars → atpakaļ uz papildināmu
      const newStatus = trunk.status === "COMPLETED" ? "NEEDS_SUPPLEMENT" : trunk.status;
      if (newStatus !== trunk.status) {
        await tx.clientDevelopmentTrunk.update({
          where: { id: trunk.id }, data: { status: newStatus },
        });
      }
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, branchId: branch.id,
        action: "BRANCH_ADDED", prevStatus: trunk.status, newStatus,
        detail: input.textLv.slice(0, 120), actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

// ─── Stumbra pabeigšana (tikai ja VISI zari izstrādāti) ─────────────

export async function completeTrunk(input: {
  clientId: string; clientTrunkId: string; sessionId?: string | null;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.$transaction(async (tx) => {
      const trunk = await tx.clientDevelopmentTrunk.findUnique({
        where: { id: input.clientTrunkId },
        include: { branches: true },
      });
      if (!trunk || trunk.clientId !== input.clientId) throw new Error("Stumbrs nav atrasts.");
      if (trunk.status === "COMPLETED") throw new Error("Stumbrs jau ir pabeigts.");
      const undone = trunk.branches.filter((b) => !b.done);
      if (undone.length > 0) {
        throw new Error(`Nevar pabeigt - neizstrādāti ${undone.length} zari.`);
      }
      if (trunk.branches.length === 0) {
        throw new Error("Stumbram nav neviena zara - vispirms pievieno zarus.");
      }
      await tx.clientDevelopmentTrunk.update({
        where: { id: trunk.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedByAdminId: session.id,
          completedSessionId: input.sessionId ?? trunk.sessionId,
        },
      });
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, action: "TRUNK_COMPLETED",
        prevStatus: trunk.status, newStatus: "COMPLETED",
        detail: input.sessionId ? `Sesija: ${input.sessionId}` : "",
        actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

export async function reopenTrunk(input: {
  clientId: string; clientTrunkId: string; reason: string;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  if (!input.reason.trim()) return { ok: false, error: "Norādi atvēršanas iemeslu." };
  try {
    await prisma.$transaction(async (tx) => {
      const trunk = await tx.clientDevelopmentTrunk.findUnique({
        where: { id: input.clientTrunkId },
      });
      if (!trunk || trunk.clientId !== input.clientId) throw new Error("Stumbrs nav atrasts.");
      if (trunk.status !== "COMPLETED") throw new Error("Tikai pabeigtu stumbru var atvērt atpakaļ.");
      await tx.clientDevelopmentTrunk.update({
        where: { id: trunk.id },
        data: { status: "NEEDS_SUPPLEMENT" },
      });
      await audit(tx, {
        clientId: input.clientId, trunkId: trunk.id, action: "TRUNK_REOPENED",
        prevStatus: "COMPLETED", newStatus: "NEEDS_SUPPLEMENT",
        detail: input.reason.trim(), actorAdminId: session.id,
      });
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

export async function assignTrunkSession(input: {
  clientId: string; clientTrunkId: string; sessionId: string | null;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    const trunk = await prisma.clientDevelopmentTrunk.findUnique({
      where: { id: input.clientTrunkId },
    });
    if (!trunk || trunk.clientId !== input.clientId) return { ok: false, error: "Stumbrs nav atrasts." };
    await prisma.clientDevelopmentTrunk.update({
      where: { id: trunk.id }, data: { sessionId: input.sessionId },
    });
    await prisma.clientDevelopmentEvent.create({
      data: {
        clientId: input.clientId, trunkId: trunk.id, action: "SESSION_ASSIGNED",
        detail: input.sessionId ?? "", actorAdminId: session.id,
      },
    });
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

// ─── Redakcionālā sasaiste: testa uzskats ↔ kartotēkas stumbrs ──────
// Globāla (visiem klientiem) apstiprināta atbilstība - ne teksta līdzība.

export async function linkBeliefToLibraryTrunk(input: {
  clientId: string; // piekļuves kontrolei + revalidate
  beliefId: string;
  libraryTrunkId: string;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.beliefTrunkLink.upsert({
      where: { beliefId_trunkId: { beliefId: input.beliefId, trunkId: input.libraryTrunkId } },
      create: {
        beliefId: input.beliefId,
        trunkId: input.libraryTrunkId,
        createdByAdminId: session.id,
      },
      update: {},
    });
    await logAuditEvent({
      action: "belief_link.create",
      resource: "belief_trunk_link",
      resourceId: `${input.beliefId}→${input.libraryTrunkId}`,
      actorAdminId: session.id,
      actorRole: session.role,
    });
    // Apstiprināta atbilstība - automātiski papildina visu skarto
    // klientu darba plānus (idempotentisks, esošo darbu nedzēš).
    const { clientsForBelief, provisionDevelopmentPlan } = await import(
      "@/lib/development/plan"
    );
    for (const cid of await clientsForBelief(input.beliefId)) {
      try {
        await provisionDevelopmentPlan(cid, session.id);
      } catch (e) {
        console.error("[development] re-provision failed for client", cid, e);
      }
    }
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

export async function unlinkBeliefFromLibraryTrunk(input: {
  clientId: string;
  beliefId: string;
  libraryTrunkId: string;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.beliefTrunkLink.delete({
      where: { beliefId_trunkId: { beliefId: input.beliefId, trunkId: input.libraryTrunkId } },
    });
    await logAuditEvent({
      action: "belief_link.delete",
      resource: "belief_trunk_link",
      resourceId: `${input.beliefId}→${input.libraryTrunkId}`,
      actorAdminId: session.id,
      actorRole: session.role,
    });
    // Klienta jau izveidotais darbs netiek dzēsts - atsaiste ietekmē
    // tikai turpmāko automātisko plāna sagatavošanu.
    revalidatePath(`/admin/clients/${input.clientId}`);
    return { ok: true };
  } catch (e) { return err(e); }
}

// ─── Retroaktīvā testa sasaiste (admin "Piesaistīt testus pēc e-pasta") ──
// Izmanto to pašu verificēto saistes funkciju; auditēts ar veicēju un ID.

export async function syncClientTestLinks(input: {
  clientId: string;
}): Promise<{ ok: true; linked: number; review: number } | { ok: false; error: string }> {
  const session = await requireClientAccess(input.clientId);
  try {
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
      select: { email: true },
    });
    if (!client) return { ok: false, error: "Klients nav atrasts." };

    // E-pasta verifikācijas pārbaude: bez verificēta portāla konta
    // (User ar uzstādītu paroli) sasaisti neveicam.
    const user = await prisma.user.findFirst({
      where: { clientId: input.clientId, role: "CLIENT" },
      select: { passwordSetAt: true },
    });
    const verified = Boolean(user?.passwordSetAt);
    if (!verified) {
      return { ok: false, error: "Klientam nav verificēta portāla konta - parole vēl nav uzstādīta." };
    }

    const { linkIdentityTestSubmissionsForClient } = await import(
      "@/lib/development/linking"
    );
    const res = await linkIdentityTestSubmissionsForClient({
      clientId: input.clientId,
      email: client.email,
    });

    if (res.linked > 0 || res.review > 0) {
      await prisma.clientDevelopmentEvent.create({
        data: {
          clientId: input.clientId,
          action: "SUBMISSION_LINKED",
          detail: `auto-sync e-pasts: linked=[${res.linkedIds.join(",")}] review=${res.review} verified=${verified}`,
          actorAdminId: session.id,
        },
      });
    }
    revalidatePath(`/admin/clients/${input.clientId}`);
    revalidatePath("/admin/identity-test/sent");
    return { ok: true, linked: res.linked, review: res.review };
  } catch (e) {
    console.error("[development]", e);
    return { ok: false, error: e instanceof Error ? e.message : "Darbība neizdevās." };
  }
}

// ─── Manuālā testa sasaiste ─────────────────────────────────────────

export async function linkSubmissionToClient(input: {
  clientId: string; submissionId: string;
}): Promise<ActionResult> {
  const session = await requireClientAccess(input.clientId);
  try {
    await prisma.identityTestSubmission.update({
      where: { id: input.submissionId },
      data: {
        clientId: input.clientId, linkStatus: "LINKED",
        linkedAt: new Date(), linkMethod: "MANUAL",
      },
    });
    await prisma.clientDevelopmentEvent.create({
      data: {
        clientId: input.clientId, action: "SUBMISSION_LINKED",
        detail: `Manuāli piesaistīts iesniegums ${input.submissionId}`,
        actorAdminId: session.id,
      },
    });
    // Manuāli piesaistīts (vēsturisks) iesniegums - tā pati automātiskā
    // darba plāna sagatavošana kā auto-saistei.
    try {
      const { provisionDevelopmentPlan } = await import("@/lib/development/plan");
      await provisionDevelopmentPlan(input.clientId, session.id);
    } catch (e) {
      console.error("[development] provision after manual link failed", e);
    }
    revalidatePath(`/admin/clients/${input.clientId}`);
    revalidatePath("/admin/identity-test/sent");
    return { ok: true };
  } catch (e) { return err(e); }
}
