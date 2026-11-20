import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { maskEmailAddress } from "@/lib/email/client";
import { decryptField } from "@/lib/security/encryption";
import { formatAdminDateTime } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function IdentitySubmissionsPage() {
  const submissions = await prisma.identityTestSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      result: { select: { id: true, email: true, name: true, createdAt: true } },
      deliveries: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Iesniegumi"
        description="Pēdējie 100 iesniegumi ar piegādes statusiem. Klikšķini uz rindas, lai redzētu portretus un sasaisti." />
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              {["Laiks", "Valoda", "Statuss", "Drošība", "Vārds", "E-pasts", "Piegādes"].map((h) => (
                <th key={h} className="type-caption px-3 py-2 text-ink-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-t border-border-subtle">
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <Link href={`/admin/identity-test/submissions/${s.id}`} className="text-accent underline underline-offset-2">
                    {formatAdminDateTime(s.createdAt.toISOString())}
                  </Link>
                </td>
                <td className="px-3 py-1.5">{s.locale}</td>
                <td className="px-3 py-1.5">{s.status}</td>
                <td className="px-3 py-1.5">{s.safetyTriggered ? "⚠" : "-"}</td>
                <td className="px-3 py-1.5">{s.result?.name ? decryptField(s.result.name) : "-"}</td>
                <td className="px-3 py-1.5">{s.result ? maskEmailAddress(decryptField(s.result.email)) : "-"}</td>
                <td className="px-3 py-1.5">
                  {s.deliveries.map((d) => `${d.emailKind}:${d.status}`).join(", ") || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
