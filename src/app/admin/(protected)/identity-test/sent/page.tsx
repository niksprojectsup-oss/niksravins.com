import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { decryptField } from "@/lib/security/encryption";

export const dynamic = "force-dynamic";

export default async function IdentitySentPage() {
  const consents = await prisma.identityEmailConsent.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      submission: {
        select: {
          locale: true,
          result: { select: { id: true } },
          deliveries: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Nosūtītie"
        description="Visas e-pasta adreses, kas ievadītas testa saņemšanai. Kopija tiek saglabāta katram iesniegumam."
      />
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              {["Laiks", "E-pasts", "Valoda", "Mārketings", "Piegādes"].map((h) => (
                <th key={h} className="type-caption px-3 py-2 text-ink-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consents.map((c) => (
              <tr key={c.id} className="border-t border-border-subtle">
                <td className="px-3 py-1.5 whitespace-nowrap">
                  {c.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                </td>
                <td className="px-3 py-1.5">{decryptField(c.email)}</td>
                <td className="px-3 py-1.5">{c.submission?.locale ?? "-"}</td>
                <td className="px-3 py-1.5">
                  {c.withdrawalTimestamp ? "atcelta" : c.marketingConsent ? "jā" : "nē"}
                </td>
                <td className="px-3 py-1.5">
                  {(c.submission?.deliveries ?? [])
                    .map((d) => `${d.emailKind}:${d.status}`)
                    .join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
