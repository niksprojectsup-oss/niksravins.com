/**
 * Automātiskā Identity Test iesniegumu sasaiste ar klienta profilu
 * pēc verificētas e-pasta adreses (HMAC hash lookup, plaintext netiek salīdzināts).
 */
import { prisma } from "@/lib/db/prisma";
import { emailHash, normalizeEmail } from "@/lib/identity-test/hash";
import { provisionDevelopmentPlan } from "@/lib/development/plan";

/**
 * Sasaista visus testa iesniegumus, kuru rezultāta/consent e-pasta hash
 * sakrīt ar klienta e-pastu. Esošā saiste uz citu klientu → REVIEW.
 * Atgriež piesaistīto iesniegumu skaitu.
 */
export async function linkIdentityTestSubmissionsForClient(input: {
  clientId: string;
  email: string;
}): Promise<{ linked: number; review: number; alreadyLinked: number; linkedIds: string[] }> {
  const hash = emailHash(normalizeEmail(input.email));

  // submissionIds, kuriem ir rezultāts vai consent ar šo e-pastu
  const [resultRows, consentRows] = await Promise.all([
    prisma.identityTestResult.findMany({
      where: { emailHash: hash },
      select: { submissionId: true },
    }),
    prisma.identityEmailConsent.findMany({
      where: { emailHash: hash, submissionId: { not: null } },
      select: { submissionId: true },
    }),
  ]);
  const submissionIds = [
    ...new Set([
      ...resultRows.map((r) => r.submissionId),
      ...consentRows.map((r) => r.submissionId).filter((v): v is string => Boolean(v)),
    ]),
  ];
  if (submissionIds.length === 0) return { linked: 0, review: 0, alreadyLinked: 0, linkedIds: [] };

  const submissions = await prisma.identityTestSubmission.findMany({
    where: { id: { in: submissionIds } },
    select: { id: true, clientId: true },
  });

  const toLink = submissions.filter((s) => s.clientId === null);
  const alreadyLinked = submissions.filter((s) => s.clientId === input.clientId);
  const toReview = submissions.filter(
    (s) => s.clientId !== null && s.clientId !== input.clientId,
  );

  const now = new Date();
  await prisma.$transaction([
    prisma.identityTestSubmission.updateMany({
      where: { id: { in: toLink.map((s) => s.id) }, clientId: null },
      data: {
        clientId: input.clientId,
        linkStatus: "LINKED",
        linkedAt: now,
        linkMethod: "AUTO",
      },
    }),
    prisma.identityTestSubmission.updateMany({
      where: { id: { in: toReview.map((s) => s.id) } },
      data: { linkStatus: "REVIEW" },
    }),
  ]);

  // Jaunpiesaistītiem iesniegumiem - automātiska darba plāna sagatavošana
  // no speciālista apstiprinātajām BeliefTrunkLink atbilstībām.
  // Kļūda nebloķē pašu saisti (iesniegums jau piesaistīts).
  if (toLink.length > 0) {
    try {
      await provisionDevelopmentPlan(input.clientId);
    } catch (e) {
      console.error("[linking] development plan provision failed", e);
    }
  }

  return {
    linked: toLink.length,
    review: toReview.length,
    alreadyLinked: alreadyLinked.length,
    linkedIds: toLink.map((s) => s.id),
  };
}

/**
 * Iesniegšanas brīža sasaiste: piesaista tikai tad, ja eksistē Client ar šo
 * normalizēto e-pastu UN klientam ir verificēts portāla konts (User ar
 * uzstādītu paroli). Ja konts vēl nav verificēts - no-op; saistīs
 * provisioning/paroles uzstādīšanas plūsma (tā ir verifikācijas notikums).
 * Nekad nemaina jau citam klientam piesaistītu ierakstu (tie → REVIEW).
 */
export async function linkSubmissionForMatchingClient(email: string): Promise<{
  clientId: string | null;
  linked: number;
  review: number;
}> {
  const client = await prisma.client.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true },
  });
  if (!client) return { clientId: null, linked: 0, review: 0 };

  const user = await prisma.user.findFirst({
    where: { clientId: client.id, role: "CLIENT" },
    select: { passwordSetAt: true },
  });
  if (!user?.passwordSetAt) return { clientId: null, linked: 0, review: 0 };

  const res = await linkIdentityTestSubmissionsForClient({ clientId: client.id, email });
  return { clientId: client.id, linked: res.linked, review: res.review };
}
