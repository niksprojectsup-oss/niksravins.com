// Kontrolēts VIENAS testa e-pasta nosūtīšanas scenārijs (Identity Test pipeline).
// Palaišana: RESEND_API_KEY=... EMAIL_FROM=... npx tsx --env-file=.env.local scripts/resend-test.ts <adrese>
// Netiek sūtīts nekam, kamēr nav norādīta adrese; subjects tiek prefiksēts ar [TEST].
import { prisma } from "../src/lib/db/prisma";
import { getEmailConfig } from "../src/lib/email/config";
import { deliverEmail, reserveDelivery } from "../src/lib/identity-test/delivery";
import { buildSequenceEmail } from "../src/lib/identity-test/email-templates";
import { resolveFieldValue } from "../src/lib/identity-test/content";
import { randomUUID } from "node:crypto";

async function main() {
  const recipient = process.argv[2]?.trim();
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    console.error("Usage: resend-test.ts <testa-adrese>");
    process.exit(1);
  }
  const cfg = getEmailConfig();
  if (!cfg.isConfigured) {
    console.error(`Trūkst env: ${cfg.missingVariables.join(", ")} - iestati .env.local vai komandas env.`);
    process.exit(1);
  }

  const template = await prisma.identityEmailTemplate.findUnique({ where: { step: "RESULT" } });
  if (!template) throw new Error("RESULT veidne nav atrasta");
  const [subject, body] = await Promise.all([
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "subject", locale: "lv" }),
    resolveFieldValue({ entityType: "EMAIL_TEMPLATE", entityId: template.id, field: "body", locale: "lv" }),
  ]);

  const content = buildSequenceEmail({
    subject: subject ?? "Identity Test rezultāts",
    bodyText: body ?? "Testa saturs",
    unsubscribeUrl: "https://www.niksravins.com/api/identity-test/unsubscribe?token=preview",
    unsubscribeLabel: "Unsubscribe",
  });
  const reserved = await reserveDelivery({
    requestId: `resend-test:${randomUUID()}`,
    recipient,
    emailKind: "ADMIN_TEST",
    step: "RESULT",
  });
  const outcome = await deliverEmail(reserved.row!.id, {
    subject: `[TEST] ${subject ?? "Identity Test"}`,
    html: content.html,
    text: content.text,
  });
  const row = await prisma.identityEmailDelivery.findUnique({ where: { id: reserved.row!.id } });
  console.log(JSON.stringify({ ok: outcome.ok, status: row?.status, providerId: row?.providerMessageId, error: row?.lastError }));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
