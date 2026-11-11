import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BeliefEditor } from "@/components/admin/identity-test/BeliefEditor";

export const dynamic = "force-dynamic";

export default async function BeliefEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const belief = await prisma.identityBelief.findUnique({
    where: { id },
    include: {
      mechanisms: { select: { tagId: true } },
      trunk: { include: { branches: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  if (!belief) notFound();

  const [subcategories, tags, translations] = await Promise.all([
    prisma.identityTestSubcategory.findMany({
      orderBy: [{ theme: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { theme: { select: { slug: true } } },
    }),
    prisma.identityMechanismTag.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.identityContentTranslation.findMany({
      where: {
        entityType: { in: ["BELIEF", "TRUNK", "BRANCH"] },
        entityId: {
          in: [belief.id, belief.trunk?.id ?? "", ...(belief.trunk?.branches.map((b) => b.id) ?? [])],
        },
      },
      select: {
        id: true, entityId: true, field: true, locale: true,
        draftValue: true, publishedValue: true, translationStatus: true,
      },
    }),
  ]);

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title={`Uzskats ${belief.stableKey}`} />
      <Link href="/admin/identity-test/beliefs" className="type-caption text-accent">← Atpakaļ uz sarakstu</Link>
      <BeliefEditor
        belief={{
          id: belief.id,
          stableKey: belief.stableKey,
          subcategoryId: belief.subcategoryId,
          sortOrder: belief.sortOrder,
          status: belief.status,
          safetyFlags: belief.safetyFlags,
          adminNotes: belief.adminNotes,
        }}
        subcategoryOptions={subcategories.map((s) => ({ id: s.id, label: `${s.theme.slug} / ${s.slug}` }))}
        tags={tags.map((t) => ({ id: t.id, key: t.key, status: t.status }))}
        selectedTagIds={belief.mechanisms.map((m) => m.tagId)}
        trunk={belief.trunk ? { id: belief.trunk.id, status: belief.trunk.status } : null}
        branches={(belief.trunk?.branches ?? []).map((b) => ({ id: b.id, sortOrder: b.sortOrder, status: b.status }))}
        translations={translations}
      />
    </div>
  );
}
