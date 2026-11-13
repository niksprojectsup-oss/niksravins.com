// Publiskās pieejamības slēdzis — servera puses vārti.
// ON → tests pieejams ikvienam bez uzaicinājuma.
// OFF → tikai derīgs beta invite cookie (testa fāze).
// Fail-closed: ja iestatījumu tabula/rinda nav pieejama → piekļuve bloķēta.
import { prisma } from "@/lib/db/prisma";
import { isBetaRequestAllowed } from "./beta";

export async function isIdentityTestPublicEnabled(): Promise<boolean> {
  try {
    const row = await prisma.identityTestSettings.findUnique({
      where: { id: "default" },
      select: { publicAccessEnabled: true },
    });
    return row?.publicAccessEnabled ?? false;
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string }).code
        : undefined;
    if (code === "P2021" || code === "P2022") return false; // tabula/kolonna vēl nav migrēta
    console.error("[identity-test] failed to read publicAccessEnabled", error);
    return false; // fail-closed
  }
}

/** Vai pieprasījums drīkst redzēt testu / iesniegt atbildes. */
export async function isIdentityTestAccessible(): Promise<boolean> {
  if (await isIdentityTestPublicEnabled()) return true;
  return isBetaRequestAllowed();
}
