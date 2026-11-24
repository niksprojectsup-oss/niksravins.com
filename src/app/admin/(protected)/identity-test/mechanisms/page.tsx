import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MechanismsManager } from "@/components/admin/identity-test/MechanismsManager";
import { formatAdminDateTime } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function IdentityMechanismsPage() {
  const [tags, connectors, translations, recentChanges] = await Promise.all([
    prisma.identityMechanismTag.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { beliefs: true } } },
    }),
    prisma.identityConnector.findMany({ orderBy: [{ kind: "asc" }, { key: "asc" }] }),
    prisma.identityContentTranslation.findMany({
      where: { entityType: "CONNECTOR", locale: { in: ["lv", "en"] } },
      select: {
        id: true, entityId: true, field: true, locale: true,
        draftValue: true, publishedValue: true, translationStatus: true,
      },
    }),
    prisma.identityContentVersion.findMany({
      where: { entityType: { in: ["CONNECTOR", "MECHANISM_TAG"] } },
      orderBy: { changedAt: "desc" },
      take: 15,
      include: { admin: { select: { email: true } } },
    }),
  ]);

  const keyById = new Map<string, string>();
  for (const t of tags) keyById.set(t.id, t.key);
  for (const c of connectors) keyById.set(c.id, c.key);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Mehānismi un savienotājfrāzes"
        description="Tagu atslēgas piešķir uzskatiem; savienotājfrāzes savieno portretu fragmentus." />
      <MechanismsManager
        tags={tags.map((t) => ({
          id: t.id, key: t.key, sortOrder: t.sortOrder, status: t.status,
          usage: t._count.beliefs, updated: formatAdminDateTime(t.updatedAt.toISOString()),
        }))}
        connectors={connectors.map((c) => ({
          id: c.id, key: c.key, kind: c.kind, status: c.status,
          updated: formatAdminDateTime(c.updatedAt.toISOString()),
        }))}
        translations={translations}
      />

      <section className="observed-card p-6">
        <h2 className="type-heading-sm">Pēdējās izmaiņas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Laiks", "Veids", "Atslēga", "Lauks", "Darbība", "Autors", "Saturs"].map((h) => (
                  <th key={h} className="type-caption px-2 py-1 text-ink-subtle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentChanges.map((v) => (
                <tr key={v.id} className="border-t border-border-subtle">
                  <td className="px-2 py-1.5 whitespace-nowrap">{formatAdminDateTime(v.changedAt.toISOString())}</td>
                  <td className="px-2 py-1.5 type-caption text-ink-faint">{v.entityType}</td>
                  <td className="px-2 py-1.5 font-mono text-xs">{keyById.get(v.entityId) ?? v.entityId.slice(-6)}</td>
                  <td className="px-2 py-1.5">{v.field}:{v.locale}</td>
                  <td className="px-2 py-1.5">{v.action}</td>
                  <td className="px-2 py-1.5">{v.admin?.email ?? "-"}</td>
                  <td className="px-2 py-1.5 max-w-xs truncate" title={v.newContent ?? ""}>
                    {v.newContent ? `${v.newContent.slice(0, 60)}${v.newContent.length > 60 ? "…" : ""}` : "-"}
                  </td>
                </tr>
              ))}
              {recentChanges.length === 0 && (
                <tr><td colSpan={7} className="px-2 py-3 text-ink-subtle">Nav izmaiņu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
