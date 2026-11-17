/**
 * Klienta attīstības darba kartes datu slānis.
 * Admin skats satur speciālista materiālus (visi pozitīvie stumbri/zari, piezīmes).
 * Klienta skats (`getClientBranchesView`) atgriež TIKAI speciālista apstiprinātu
 * pozitīvo saturu: COMPLETED stumbrus + izstrādātos zarus. Neapstiprināts pozitīvais
 * saturs un profesionālās piezīmes netiek ielasītas klienta ceļā vispār.
 */
import { prisma } from "@/lib/db/prisma";
import { resolveTranslation } from "@/lib/identity-test/content";
import { decryptField } from "@/lib/security/encryption";
import {
  getClientDevelopmentProgress,
  type DevelopmentProgress,
} from "@/lib/development/progress";

// ─── Admin skats ────────────────────────────────────────────────────

export type AdminBeliefItem = {
  beliefId: string;
  stableKey: string;
  text: string;
  themeName: string;
  themeSort: number;
  subcategoryName: string;
  isSensitiveTheme: boolean;
  linkedLibraryTrunk: { id: string; libraryKey: string; titleLv: string } | null;
  addedToPlan: boolean;
};

export type AdminDevBranch = {
  id: string;
  textLv: string;
  textEn: string;
  done: boolean;
  doneAt: Date | null;
  sortOrder: number;
};

export type AdminDevTrunk = {
  id: string;
  libraryKey: string | null;
  titleLv: string;
  titleEn: string;
  negativeBelief: string;
  themeTitle: string | null;
  origin: "LIBRARY" | "CUSTOM";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_SUPPLEMENT";
  sessionId: string | null;
  completedSessionId: string | null;
  completedAt: Date | null;
  beliefStableKey: string | null;
  branches: AdminDevBranch[];
};

export type AdminSubmission = {
  id: string;
  createdAt: Date;
  locale: string;
  linkStatus: string;
  safetyTriggered: boolean;
  beliefs: AdminBeliefItem[];
};

export type DevHistoryEvent = {
  id: string;
  action: string;
  prevStatus: string | null;
  newStatus: string | null;
  detail: string;
  actorAdminId: string | null;
  createdAt: Date;
};

export type AdminDevelopmentCard = {
  progress: DevelopmentProgress;
  submissions: AdminSubmission[];
  trunks: AdminDevTrunk[];
  history: DevHistoryEvent[];
  sessions: { id: string; scheduledAt: Date; sessionNumber: number | null; status: string }[];
  libraryTrunks: {
    id: string; libraryKey: string; titleLv: string; titleEn: string;
    themeTitle: string; negativeBelief: string;
    branches: { id: string; textLv: string; textEn: string; sortOrder: number }[];
  }[];
  unlinkedBeliefCount: number;
};

async function resolveEntityTexts(
  refs: { entityType: "BELIEF" | "THEME" | "SUBCATEGORY"; entityId: string; field: string }[],
  locale: string,
): Promise<Map<string, string>> {
  if (refs.length === 0) return new Map();
  const translations = await prisma.identityContentTranslation.findMany({
    where: {
      OR: refs.map((r) => ({
        entityType: r.entityType,
        entityId: r.entityId,
        field: r.field,
      })),
      publishedValue: { not: null },
    },
  });
  const map = new Map<string, string>();
  for (const r of refs) {
    const v = resolveTranslation(translations, {
      entityId: r.entityId,
      field: r.field,
      locale,
    });
    map.set(`${r.entityType}:${r.entityId}:${r.field}`, v?.value ?? "");
  }
  return map;
}

export async function getAdminDevelopmentCard(clientId: string): Promise<AdminDevelopmentCard> {
  const [progress, submissions, devTrunks, history, sessions, libraryTrunks, trunkLinks] =
    await Promise.all([
      getClientDevelopmentProgress(clientId),
      prisma.identityTestSubmission.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        include: { result: { select: { id: true, snapshot: true, email: true } } },
      }),
      prisma.clientDevelopmentTrunk.findMany({
        where: { clientId },
        orderBy: { sortOrder: "asc" },
        include: {
          branches: { orderBy: { sortOrder: "asc" } },
          libraryTrunk: { include: { theme: true } },
          belief: true,
        },
      }),
      prisma.clientDevelopmentEvent.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.session.findMany({
        where: { clientId },
        orderBy: { scheduledAt: "desc" },
        take: 30,
        select: { id: true, scheduledAt: true, sessionNumber: true, status: true },
      }),
      prisma.beliefLibraryTrunk.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ theme: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        include: { theme: true, branches: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.beliefTrunkLink.findMany({ include: { trunk: true } }),
    ]);

  // Visi izvēlēto uzskatu ID
  const allBeliefIds = [...new Set(submissions.flatMap((s) => s.selectedBeliefIds))];
  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: allBeliefIds } },
    include: { subcategory: { include: { theme: true } }, trunkLinks: { include: { trunk: true } } },
  });
  const beliefMap = new Map(beliefs.map((b) => [b.id, b]));
  const linksByBelief = new Map(trunkLinks.map((l) => [l.beliefId, l.trunk]));
  const plannedBeliefIds = new Set(
    devTrunks.flatMap((t) => [t.beliefId, ...t.beliefIds]).filter(Boolean) as string[],
  );

  // Teksti: uzskati + tēmu/apakštēmu nosaukumi
  const textRefs = beliefs.flatMap((b) => [
    { entityType: "BELIEF" as const, entityId: b.id, field: "text" },
    { entityType: "THEME" as const, entityId: b.subcategory.themeId, field: "name" },
    { entityType: "SUBCATEGORY" as const, entityId: b.subcategoryId, field: "name" },
  ]);
  const texts = await resolveEntityTexts(textRefs, "lv");

  const mapBelief = (beliefId: string): AdminBeliefItem => {
    const b = beliefMap.get(beliefId);
    const linked = linksByBelief.get(beliefId);
    return {
      beliefId,
      stableKey: b?.stableKey ?? beliefId,
      text: texts.get(`BELIEF:${beliefId}:text`) ?? "",
      themeName: b ? (texts.get(`THEME:${b.subcategory.themeId}:name`) ?? b.subcategory.theme.slug) : "",
      themeSort: b?.subcategory.theme.sortOrder ?? 999,
      subcategoryName: b ? (texts.get(`SUBCATEGORY:${b.subcategoryId}:name`) ?? "") : "",
      isSensitiveTheme: b?.subcategory.theme.isSensitive ?? false,
      linkedLibraryTrunk: linked
        ? { id: linked.id, libraryKey: linked.libraryKey, titleLv: linked.titleLv }
        : null,
      addedToPlan: plannedBeliefIds.has(beliefId),
    };
  };

  const allSeenBeliefIds = new Set<string>();
  const mappedSubmissions: AdminSubmission[] = submissions.map((s) => {
    const items = s.selectedBeliefIds.map(mapBelief);
    s.selectedBeliefIds.forEach((id) => allSeenBeliefIds.add(id));
    return {
      id: s.id,
      createdAt: s.createdAt,
      locale: s.locale,
      linkStatus: s.linkStatus,
      safetyTriggered: s.safetyTriggered,
      beliefs: items,
    };
  });

  return {
    progress,
    submissions: mappedSubmissions,
    trunks: devTrunks.map((t) => ({
      id: t.id,
      libraryKey: t.libraryTrunk?.libraryKey ?? null,
      titleLv: t.titleLv,
      titleEn: t.titleEn,
      negativeBelief: t.libraryTrunk?.negativeBelief ?? "",
      themeTitle: t.libraryTrunk?.theme.titleLv ?? null,
      origin: t.origin,
      status: t.status,
      sessionId: t.sessionId,
      completedSessionId: t.completedSessionId,
      completedAt: t.completedAt,
      beliefStableKey: t.belief?.stableKey ?? null,
      branches: t.branches.map((b) => ({
        id: b.id,
        textLv: b.textLv,
        textEn: b.textEn,
        done: b.done,
        doneAt: b.doneAt,
        sortOrder: b.sortOrder,
      })),
    })),
    history: history.map((h) => ({
      id: h.id, action: h.action, prevStatus: h.prevStatus, newStatus: h.newStatus,
      detail: h.detail, actorAdminId: h.actorAdminId, createdAt: h.createdAt,
    })),
    sessions: sessions.map((s) => ({
      id: s.id, scheduledAt: s.scheduledAt, sessionNumber: s.sessionNumber, status: s.status,
    })),
    libraryTrunks: libraryTrunks.map((t) => ({
      id: t.id, libraryKey: t.libraryKey, titleLv: t.titleLv, titleEn: t.titleEn,
      themeTitle: t.theme.titleLv, negativeBelief: t.negativeBelief,
      branches: t.branches.map((b) => ({ id: b.id, textLv: b.textLv, textEn: b.textEn, sortOrder: b.sortOrder })),
    })),
    unlinkedBeliefCount: mappedSubmissions
      .flatMap((s) => s.beliefs)
      .filter((b) => !b.linkedLibraryTrunk && !b.addedToPlan)
      .length,
  };
}

/** Testa rezultāta portreti (adminam) - atšifrēti servera pusē. */
export async function getSubmissionResultForAdmin(submissionId: string) {
  const result = await prisma.identityTestResult.findUnique({
    where: { submissionId },
    include: { submission: true },
  });
  if (!result) return null;
  return {
    submissionId,
    email: decryptField(result.email),
    createdAt: result.submission.createdAt,
    locale: result.submission.locale,
    linkStatus: result.submission.linkStatus,
    clientId: result.submission.clientId,
    portraitNow: decryptField(result.portraitNow),
    portraitFuture: decryptField(result.portraitFuture),
    safetyTriggered: result.submission.safetyTriggered,
  };
}

// ─── Klienta skats (BEZ pozitīvā satura) ────────────────────────────

export type ClientBeliefGroup = {
  themeName: string;
  themeSort: number;
  beliefs: { text: string }[];
};

/** Publicētais saturs - tikai speciālista APSTIPRINĀTI (COMPLETED) stumbri. */
export type ClientCompletedTrunk = {
  id: string;
  title: string;
  completedAt: Date | null;
  branches: { text: string; doneAt: Date | null }[];
};

export type ClientBranchesView = {
  progress: DevelopmentProgress;
  groups: ClientBeliefGroup[];
  completedTrunks: ClientCompletedTrunk[];
  hasTest: boolean;
};

export async function getClientBranchesView(clientId: string, locale: string): Promise<ClientBranchesView> {
  const isEn = locale.startsWith("en");
  const [progress, submissions, completedTrunks] = await Promise.all([
    getClientDevelopmentProgress(clientId),
    prisma.identityTestSubmission.findMany({
      where: { clientId },
      orderBy: { createdAt: "asc" },
      select: { selectedBeliefIds: true },
    }),
    // Tikai COMPLETED - publicētais, speciālista apstiprinātais saturs.
    // Atvērts stumbrs (NEEDS_SUPPLEMENT) vairs nav redzams kā pabeigts.
    prisma.clientDevelopmentTrunk.findMany({
      where: { clientId, status: "COMPLETED" },
      orderBy: { completedAt: "asc" },
      select: {
        id: true, titleLv: true, titleEn: true, completedAt: true,
        branches: {
          where: { done: true },
          orderBy: { sortOrder: "asc" },
          select: { textLv: true, textEn: true, doneAt: true },
        },
      },
    }),
  ]);

  const mappedTrunks: ClientCompletedTrunk[] = completedTrunks.map((t) => ({
    id: t.id,
    title: (isEn ? t.titleEn || t.titleLv : t.titleLv || t.titleEn),
    completedAt: t.completedAt,
    branches: t.branches.map((b) => ({
      text: (isEn ? b.textEn || b.textLv : b.textLv || b.textEn),
      doneAt: b.doneAt,
    })),
  }));

  const beliefIds = [...new Set(submissions.flatMap((s) => s.selectedBeliefIds))];
  if (beliefIds.length === 0) {
    return { progress, groups: [], completedTrunks: mappedTrunks, hasTest: submissions.length > 0 };
  }

  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: beliefIds } },
    include: { subcategory: { include: { theme: true } } },
  });

  const textRefs = beliefs.flatMap((b) => [
    { entityType: "BELIEF" as const, entityId: b.id, field: "text" },
    { entityType: "THEME" as const, entityId: b.subcategory.themeId, field: "name" },
  ]);
  const texts = await resolveEntityTexts(textRefs, locale);

  const groupMap = new Map<string, ClientBeliefGroup>();
  for (const b of beliefs) {
    const theme = b.subcategory.theme;
    const name = texts.get(`THEME:${theme.id}:name`) ?? theme.slug;
    const existing = groupMap.get(theme.id);
    const text = texts.get(`BELIEF:${b.id}:text`) ?? "";
    if (existing) {
      existing.beliefs.push({ text });
    } else {
      groupMap.set(theme.id, { themeName: name, themeSort: theme.sortOrder, beliefs: [{ text }] });
    }
  }
  const groups = [...groupMap.values()].sort((a, b) => a.themeSort - b.themeSort);
  return { progress, groups, completedTrunks: mappedTrunks, hasTest: true };
}
