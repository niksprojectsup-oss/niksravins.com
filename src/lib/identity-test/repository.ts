import { prisma } from "@/lib/db/prisma";
import {
  loadPublishedTranslations,
  resolveTranslation,
  resolveSingleton,
} from "./content";
import type {
  ConnectorTexts,
  EmailThemeSection,
  GenerationSnapshot,
  PublicBelief,
  PublicSubcategory,
  PublicTheme,
  ResolvedBeliefContent,
  TestContentTree,
} from "./types";

export const CRISIS_BLOCK_ID = "crisis-block";
export const CONSENT_TEXT_ID = "marketing-consent";

/** Publiskajam testam: tikai PUBLISHED saturs ar locale fallback. */
export async function getPublicTestContent(locale: string): Promise<TestContentTree> {
  const themes = await prisma.identityTestTheme.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
  const subcategories = await prisma.identityTestSubcategory.findMany({
    where: { status: "PUBLISHED", themeId: { in: themes.map((t) => t.id) } },
    orderBy: { sortOrder: "asc" },
  });
  const beliefs = await prisma.identityBelief.findMany({
    where: {
      status: "PUBLISHED",
      subcategoryId: { in: subcategories.map((s) => s.id) },
    },
    orderBy: { sortOrder: "asc" },
  });

  const [themeT, subT, beliefT] = await Promise.all([
    loadPublishedTranslations({ entityType: "THEME", entityIds: themes.map((t) => t.id), fields: ["name", "description"] }),
    loadPublishedTranslations({ entityType: "SUBCATEGORY", entityIds: subcategories.map((s) => s.id), fields: ["name"] }),
    loadPublishedTranslations({ entityType: "BELIEF", entityIds: beliefs.map((b) => b.id), fields: ["text"] }),
  ]);

  const outThemes: PublicTheme[] = themes
    .map((t) => ({
      id: t.id, slug: t.slug, isSensitive: t.isSensitive,
      name: resolveTranslation(themeT, { entityId: t.id, field: "name", locale })?.value ?? t.slug,
      description: resolveTranslation(themeT, { entityId: t.id, field: "description", locale })?.value,
    }))
    .filter((t) => subcategories.some((s) => s.themeId === t.id));

  const outSubs: PublicSubcategory[] = subcategories
    .map((s) => ({
      id: s.id, slug: s.slug, themeId: s.themeId,
      name: resolveTranslation(subT, { entityId: s.id, field: "name", locale })?.value ?? s.slug,
    }))
    .filter((s) => beliefs.some((b) => b.subcategoryId === s.id));

  const outBeliefs: PublicBelief[] = beliefs
    .map((b) => ({
      id: b.id, stableKey: b.stableKey, subcategoryId: b.subcategoryId,
      text: resolveTranslation(beliefT, { entityId: b.id, field: "text", locale })?.value ?? "",
      safetyFlags: b.safetyFlags,
    }))
    .filter((b) => b.text !== "");

  return { themes: outThemes, subcategories: outSubs, beliefs: outBeliefs };
}

/** Pilns uzskata saturs ģenerēšanai (ar fragmentiem, stumbriem, zariem, tagiem). */
export async function loadBeliefsForGeneration(
  beliefIds: string[],
  locale: string,
): Promise<ResolvedBeliefContent[]> {
  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: beliefIds }, status: "PUBLISHED" },
    include: {
      subcategory: { include: { theme: true } },
      trunk: { include: { branches: { orderBy: { sortOrder: "asc" } } } },
      mechanisms: { include: { tag: true } },
    },
  });

  const ids = beliefs.map((b) => b.id);
  const trunkIds = beliefs.map((b) => b.trunk?.id).filter((v): v is string => Boolean(v));
  const branchIds = beliefs.flatMap((b) => b.trunk?.branches.map((br) => br.id) ?? []);
  const entityIds = [...ids, ...trunkIds, ...branchIds];

  const subcatIds = beliefs.map((b) => b.subcategoryId);
  const themeIds = beliefs.map((b) => b.subcategory.themeId);
  const translations = entityIds.length
    ? await prisma.identityContentTranslation.findMany({
        where: {
          OR: [
            { entityType: { in: ["BELIEF", "TRUNK", "BRANCH"] }, entityId: { in: entityIds } },
            { entityType: "SUBCATEGORY", entityId: { in: subcatIds }, field: "name" },
            { entityType: "THEME", entityId: { in: themeIds }, field: "name" },
          ],
          publishedValue: { not: null },
        },
      })
    : [];

  return beliefs.map((b) => {
    const resolved = (entityId: string, field: string) =>
      resolveTranslation(translations, { entityId, field, locale });
    const text = resolved(b.id, "text");
    return {
      id: b.id,
      stableKey: b.stableKey,
      negativeBelief: text?.value ?? "",
      portraitNow: resolved(b.id, "portraitNow")?.value ?? "",
      portraitFuture: resolved(b.id, "portraitFuture")?.value ?? "",
      trunk: b.trunk ? (resolved(b.trunk.id, "text")?.value ?? "") : "",
      branches: (b.trunk?.branches ?? [])
        .filter((br) => br.status === "PUBLISHED")
        .map((br) => resolved(br.id, "text")?.value ?? "")
        .filter(Boolean),
      mechanismKeys: b.mechanisms.map((m) => m.tag.key),
      safetyFlags: b.safetyFlags,
      themeId: b.subcategory.themeId,
      themeSlug: b.subcategory.theme.slug,
      themeName: resolved(b.subcategory.themeId, "name")?.value ?? b.subcategory.theme.slug,
      subcategoryName: resolved(b.subcategoryId, "name")?.value ?? "",
      resolvedLocale: text?.resolvedLocale ?? locale,
    } satisfies ResolvedBeliefContent;
  });
}

/** Savienotājfrāzes (PUBLISHED) ar locale fallback. */
export async function loadConnectors(locale: string): Promise<{ texts: ConnectorTexts; snapshot: Record<string, string> }> {
  const connectors = await prisma.identityConnector.findMany({
    where: { status: "PUBLISHED" },
  });
  if (connectors.length === 0) return { texts: {}, snapshot: {} };

  const rows = await prisma.identityContentTranslation.findMany({
    where: { entityType: "CONNECTOR", entityId: { in: connectors.map((c) => c.id) }, publishedValue: { not: null } },
  });

  const texts: ConnectorTexts = {};
  const snapshot: Record<string, string> = {};
  for (const c of connectors) {
    const resolved = resolveTranslation(rows, { entityId: c.id, field: "text", locale });
    if (!resolved) continue;
    snapshot[c.key] = resolved.value;
    const kind = c.kind.toLowerCase();
    if (kind === "opening") texts.opening = resolved.value;
    else if (kind === "join_similar") texts.joinSimilar = resolved.value;
    else if (kind === "join_contrast") texts.joinContrast = resolved.value;
    else if (kind === "transition") texts.transition = resolved.value;
    else if (kind === "closing") texts.closing = resolved.value;
    if (c.key === "closing-future") texts.closingFuture = resolved.value;
  }
  return { texts, snapshot };
}

export async function loadSafetyBlock(locale: string): Promise<string | null> {
  const resolved = await resolveSingleton({
    entityType: "SAFETY_TEXT", entityId: CRISIS_BLOCK_ID, field: "body", locale,
  });
  return resolved?.value ?? null;
}

export async function loadConsentText(locale: string): Promise<{ value: string; sourceVersion: number } | null> {
  return resolveSingleton({
    entityType: "CONSENT_TEXT", entityId: CONSENT_TEXT_ID, field: "label", locale,
  });
}

export function buildSnapshot(input: {
  locale: string;
  beliefs: ResolvedBeliefContent[];
  connectors: Record<string, string>;
  safetyBlock?: string;
  sourceVersions: number[];
  emailThemes?: EmailThemeSection[];
}): GenerationSnapshot {
  const usedThemes = new Map<string, { themeId: string; slug: string; name: string }>();
  return {
    generatedAt: new Date().toISOString(),
    locale: input.locale,
    contentVersion: Math.max(1, ...input.sourceVersions),
    emailThemes: input.emailThemes,
    beliefs: input.beliefs.map((b) => {
      usedThemes.set(b.themeId, { themeId: b.themeId, slug: b.themeSlug, name: b.themeName });
      return {
        beliefId: b.id,
        stableKey: b.stableKey,
        negativeBelief: b.negativeBelief,
        portraitNow: b.portraitNow,
        portraitFuture: b.portraitFuture,
        trunk: b.trunk,
        branches: b.branches,
        mechanismKeys: b.mechanismKeys,
        safetyFlags: b.safetyFlags,
        theme: { id: b.themeId, slug: b.themeSlug, name: b.themeName },
        subcategory: { id: "", name: b.subcategoryName },
        resolvedLocale: b.resolvedLocale,
        sourceVersion: 1,
      };
    }),
    themes: [...usedThemes.values()],
    connectors: input.connectors,
    safetyBlock: input.safetyBlock,
  };
}
