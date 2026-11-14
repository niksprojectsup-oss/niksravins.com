import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageHeader";
import { BulkPublishButton } from "@/components/admin/identity-test/BulkPublishButton";

export const dynamic = "force-dynamic";

type Search = { theme?: string; subcategory?: string; status?: string; q?: string };

export default async function IdentityBeliefsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { theme, subcategory, status, q } = await searchParams;
  const [themes, beliefs, publishedFields] = await Promise.all([
    prisma.identityTestTheme.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true } }),
    prisma.identityBelief.findMany({
      where: {
        ...(subcategory ? { subcategoryId: subcategory } : theme ? { subcategory: { themeId: theme } } : {}),
        ...(status ? { status: status as never } : {}),
        ...(q ? { stableKey: { contains: q, mode: "insensitive" as const } } : {}),
      },
      orderBy: { stableKey: "asc" },
      include: { subcategory: { select: { slug: true, theme: { select: { slug: true } } } } },
      take: 400,
    }),
    prisma.identityContentTranslation.findMany({
      where: { entityType: "BELIEF", locale: "lv", publishedValue: { not: null } },
      select: { entityId: true, field: true },
    }),
  ]);

  const fields = new Set(publishedFields.map((f) => `${f.entityId}:${f.field}`));
  const complete = (id: string) =>
    ["text", "portraitNow", "portraitFuture"].every((f) => fields.has(`${id}:${f}`));

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Uzskati" description={`${beliefs.length} ieraksti. LV fragmentu pilnība atzīmēta kolonnā “Pilns”.`} />
      <AdminPanel title="Filtrs">
        <form className="flex flex-wrap items-center gap-3">
          <select name="theme" defaultValue={theme ?? ""} className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-ink">
            <option value="">Visas tēmas</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.slug}</option>
            ))}
          </select>
          <select name="status" defaultValue={status ?? ""} className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-ink">
            <option value="">Visi statusi</option>
            {["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "DISABLED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="q" defaultValue={q ?? ""} placeholder="Meklēt stableKey" className="min-h-10 rounded-md border border-border bg-surface px-3 text-sm text-ink" />
          <button type="submit" className="type-caption rounded-full bg-accent px-4 py-2 text-surface">Filtrēt</button>
          <BulkPublishButton />
        </form>
      </AdminPanel>
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              {["Atslēga", "Tēma", "Apakštēma", "Statuss", "Drošība", "Pilns", ""].map((h) => (
                <th key={h} className="type-caption px-3 py-2 text-ink-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beliefs.map((b) => (
              <tr key={b.id} className="border-t border-border-subtle">
                <td className="px-3 py-2 font-mono text-xs">{b.stableKey}</td>
                <td className="px-3 py-2">{b.subcategory.theme.slug}</td>
                <td className="px-3 py-2">{b.subcategory.slug}</td>
                <td className="px-3 py-2">{b.status}</td>
                <td className="px-3 py-2">{b.safetyFlags.length ? b.safetyFlags.join(",") : "-"}</td>
                <td className="px-3 py-2">{complete(b.id) ? "✓" : "-"}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/identity-test/beliefs/${b.id}`} className="text-accent">Rediģēt</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
