import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PreviewTool } from "@/components/admin/identity-test/PreviewTool";

export const dynamic = "force-dynamic";

export default async function IdentityPreviewPage() {
  const beliefs = await prisma.identityBelief.findMany({ orderBy: { stableKey: "asc" }, select: { id: true, stableKey: true } });
  const texts = await prisma.identityContentTranslation.findMany({
    where: { entityType: "BELIEF", field: "text", locale: "lv" },
    select: { entityId: true, publishedValue: true, draftValue: true },
  });
  const label = new Map(texts.map((t) => [t.entityId, t.publishedValue ?? t.draftValue]));

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Rezultātu priekšskatījums"
        description="Izvēlies uzskatus un valodu — portretu kompozīcija izmanto melnrakstu vai publicētos tekstus. Nekas netiek nosūtīts." />
      <PreviewTool beliefs={beliefs.map((b) => ({ id: b.id, stableKey: b.stableKey, label: label.get(b.id) ?? "" }))} />
    </div>
  );
}
