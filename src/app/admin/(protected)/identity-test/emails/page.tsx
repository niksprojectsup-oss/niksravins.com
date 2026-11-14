import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { EmailManager } from "@/components/admin/identity-test/EmailManager";
import { DeliveryActions } from "@/components/admin/identity-test/DeliveryActions";
import { maskEmailAddress } from "@/lib/email/client";
import { decryptField } from "@/lib/security/encryption";

export const dynamic = "force-dynamic";

export default async function IdentityEmailsPage() {
  const [templates, translations, deliveries, sequences] = await Promise.all([
    prisma.identityEmailTemplate.findMany(),
    prisma.identityContentTranslation.findMany({
      where: { entityType: "EMAIL_TEMPLATE", locale: { in: ["lv", "en"] } },
      select: {
        id: true, entityId: true, field: true, locale: true,
        draftValue: true, publishedValue: true, translationStatus: true,
      },
    }),
    prisma.identityEmailDelivery.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.identityEmailSequence.findMany({ orderBy: { nextSendAt: "asc" }, take: 50 }),
  ]);

  const mask = (enc: string) => maskEmailAddress(decryptField(enc));

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="E-pasti un secības" description="Veidnes, piegādes un plānotās secības." />
      <EmailManager
        templates={templates.map((t) => ({ id: t.id, step: t.step, delayDays: t.delayDays, status: t.status }))}
        translations={translations}
      />
      <AdminPanel title="Piegādes (pēdējās 50)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr>{["Veids", "Solis", "Saņēmējs", "Statuss", "Mēģinājumi", "Kļūda", ""].map((h) => <th key={h} className="type-caption px-2 py-1 text-ink-subtle">{h}</th>)}</tr></thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t border-border-subtle">
                  <td className="px-2 py-1.5">{d.emailKind}</td>
                  <td className="px-2 py-1.5">{d.step ?? "-"}</td>
                  <td className="px-2 py-1.5">{mask(d.recipient)}</td>
                  <td className="px-2 py-1.5">{d.status}</td>
                  <td className="px-2 py-1.5">{d.attemptCount}</td>
                  <td className="max-w-xs truncate px-2 py-1.5 text-ink-faint">{d.lastError ?? "-"}</td>
                  <td className="px-2 py-1.5">
                    <DeliveryActions id={d.id} canResend={d.status === "FAILED"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
      <AdminPanel title="Secības (pēdējās 50)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr>{["Saņēmējs", "Nākamais solis", "Plānots", "Statuss", ""].map((h) => <th key={h} className="type-caption px-2 py-1 text-ink-subtle">{h}</th>)}</tr></thead>
            <tbody>
              {sequences.map((s) => (
                <tr key={s.id} className="border-t border-border-subtle">
                  <td className="px-2 py-1.5">{mask(s.email)}</td>
                  <td className="px-2 py-1.5">{s.nextStep}</td>
                  <td className="px-2 py-1.5">{s.nextSendAt.toISOString().slice(0, 10)}</td>
                  <td className="px-2 py-1.5">{s.status}</td>
                  <td className="px-2 py-1.5">
                    {s.status === "ACTIVE" || s.status === "PROCESSING" ? <DeliveryActions sequenceId={s.id} canCancel /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
