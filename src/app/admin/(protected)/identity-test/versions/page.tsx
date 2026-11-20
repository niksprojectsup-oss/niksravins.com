import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VersionRestoreButton } from "@/components/admin/identity-test/VersionRestoreButton";
import { formatAdminDateTime } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function IdentityVersionsPage() {
  const versions = await prisma.identityContentVersion.findMany({
    orderBy: { changedAt: "desc" },
    take: 200,
    include: { admin: { select: { email: true } } },
  });

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Versiju vēsture" description="Pēdējās 200 satura izmaiņas. “Atjaunot” ieliek iepriekšējo saturu melnrakstā." />
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              {["Laiks", "Entītija", "Lauks", "Valoda", "Darbība", "Autors", ""].map((h) => (
                <th key={h} className="type-caption px-3 py-2 text-ink-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id} className="border-t border-border-subtle">
                <td className="px-3 py-1.5 whitespace-nowrap">{formatAdminDateTime(v.changedAt.toISOString())}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{v.entityType}:{v.entityId.slice(0, 8)}</td>
                <td className="px-3 py-1.5">{v.field}</td>
                <td className="px-3 py-1.5">{v.locale}</td>
                <td className="px-3 py-1.5">{v.action}</td>
                <td className="px-3 py-1.5">{v.admin?.email ?? "-"}</td>
                <td className="px-3 py-1.5">
                  {v.previousContent !== null ? <VersionRestoreButton id={v.id} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
