/**
 * Automātiskā Identity Test iesniegumu sasaiste ar klienta profilu
 * pēc verificētas e-pasta adreses (HMAC hash lookup, plaintext netiek salīdzināts).
 */
import { prisma } from "@/lib/db/prisma";
import { emailHash, normalizeEmail } from "@/lib/identity-test/hash";

/**
 * Sasaista visus testa iesniegumus, kuru rezultāta/consent e-pasta hash
 * sakrīt ar klienta e-pastu. Esošā saiste uz citu klientu → REVIEW.
 * Atgriež piesaistīto iesniegumu skaitu.
 */
export async function linkIdentityTestSubmissionsForClient(input: {
  clientId: string;
  email: string;
}): Promise<{ linked: number; review: number }> {
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
  if (submissionIds.length === 0) return { linked: 0, review: 0 };

  const submissions = await prisma.identityTestSubmission.findMany({
    where: { id: { in: submissionIds } },
    select: { id: true, clientId: true },
  });

  const toLink = submissions.filter(
    (s) => s.clientId === null || s.clientId === input.clientId,
  );
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

  return { linked: toLink.length, review: toReview.length };
}
