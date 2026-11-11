import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MechanismsManager } from "@/components/admin/identity-test/MechanismsManager";

export const dynamic = "force-dynamic";

export default async function IdentityMechanismsPage() {
  const [tags, connectors, translations] = await Promise.all([
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
  ]);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Mehānismi un savienotājfrāzes"
        description="Tagu atslēgas piešķir uzskatiem; savienotājfrāzes savieno portretu fragmentus." />
      <MechanismsManager
        tags={tags.map((t) => ({ id: t.id, key: t.key, sortOrder: t.sortOrder, status: t.status, usage: t._count.beliefs }))}
        connectors={connectors.map((c) => ({ id: c.id, key: c.key, kind: c.kind, status: c.status }))}
        translations={translations}
      />
    </div>
  );
}
