import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ThemesManager } from "@/components/admin/identity-test/ThemesManager";

export const dynamic = "force-dynamic";

export default async function IdentityThemesPage() {
  const [themes, translations] = await Promise.all([
    prisma.identityTestTheme.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { beliefs: true } } },
        },
      },
    }),
    prisma.identityContentTranslation.findMany({
      where: { entityType: { in: ["THEME", "SUBCATEGORY"] }, locale: { in: ["lv", "en"] } },
      select: {
        id: true, entityId: true, field: true, locale: true,
        draftValue: true, publishedValue: true, translationStatus: true,
      },
    }),
  ]);

  const data = themes.map((t) => ({
    id: t.id,
    slug: t.slug,
    sortOrder: t.sortOrder,
    status: t.status,
    isSensitive: t.isSensitive,
    subcategories: t.subcategories.map((s) => ({
      id: s.id,
      slug: s.slug,
      status: s.status,
      beliefCount: s._count.beliefs,
    })),
  }));

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Tēmas un apakštēmas"
        description="Struktūra, LV/EN nosaukumi un publikācijas statusi. Pārējās valodas — sadaļā Tulkojumi."
      />
      <ThemesManager themes={data} translations={translations} />
    </div>
  );
}
