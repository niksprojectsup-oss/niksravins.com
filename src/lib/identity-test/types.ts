import type {
  IdentityContentEntityType,
  IdentityEmailStep,
  IdentitySafetyFlag,
} from "@prisma/client";

export type PublicTheme = {
  id: string;
  slug: string;
  name: string;
  isSensitive: boolean;
  description?: string;
};

export type PublicSubcategory = {
  id: string;
  slug: string;
  themeId: string;
  name: string;
};

export type PublicBelief = {
  id: string;
  stableKey: string;
  subcategoryId: string;
  text: string;
  safetyFlags: IdentitySafetyFlag[];
};

export type TestContentTree = {
  themes: PublicTheme[];
  subcategories: PublicSubcategory[];
  beliefs: PublicBelief[];
};

export type ContentFieldKey = {
  entityType: IdentityContentEntityType;
  entityId: string;
  field: string;
};

export type ResolvedBeliefContent = {
  id: string;
  stableKey: string;
  negativeBelief: string;
  portraitNow: string;
  portraitFuture: string;
  trunk: string;
  branches: string[];
  mechanismKeys: string[];
  safetyFlags: IdentitySafetyFlag[];
  themeId: string;
  themeSlug: string;
  themeName: string;
  subcategoryName: string;
  resolvedLocale: string;
};

export type ConnectorTexts = {
  opening?: string;
  joinSimilar?: string;
  joinContrast?: string;
  transition?: string;
  closing?: string;
  closingFuture?: string;
};

/** Rezultāta e-pasta tēmu līmeņa pārskata sadaļa. */
export type EmailThemeSection = {
  name: string;
  /** Apvienots portreta apraksts no tēmas izvēlēto apgalvojumu portraitNow fragmentiem. */
  now: string;
  /** Apvienots apraksts no tēmas izvēlēto apgalvojumu portraitFuture fragmentiem. */
  future: string;
};

export type GenerationSnapshot = {
  generatedAt: string;
  locale: string;
  contentVersion: number;
  /**
   * Ģenerēšanas brīdī atrisinātās e-pasta tēmu sadaļas. Saglabātas snapshotā,
   * lai vēsturiskā rezultāta atkārtotā sūtīšana neatkarīgā no vēlākām
   * BeliefTrunkLink kartējuma izmaiņām atgrieztu identisku saturu.
   */
  emailThemes?: EmailThemeSection[];
  beliefs: {
    beliefId: string;
    stableKey: string;
    negativeBelief: string;
    portraitNow: string;
    portraitFuture: string;
    trunk: string;
    branches: string[];
    mechanismKeys: string[];
    safetyFlags: IdentitySafetyFlag[];
    theme: { id: string; slug: string; name: string };
    subcategory: { id: string; name: string };
    resolvedLocale: string;
    sourceVersion: number;
  }[];
  themes: { themeId: string; slug: string; name: string }[];
  connectors: Record<string, string>;
  safetyBlock?: string;
};

export type SubmitPayload = {
  requestId: string;
  email: string;
  marketingConsent: boolean;
  locale: string;
  beliefIds: string[];
};

export type SubmitResult =
  | { ok: true; submissionId: string }
  | { ok: false; reason: "invalid" | "validation" | "email_failed"; message?: string; submissionId?: string };

export const IDENTITY_EMAIL_STEPS: IdentityEmailStep[] = [
  "RESULT",
  "DAY_1",
  "DAY_3",
  "DAY_5",
];
