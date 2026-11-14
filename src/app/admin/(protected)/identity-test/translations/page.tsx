import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getTranslationsOverview } from "@/lib/identity-test/admin-repository";

export const dynamic = "force-dynamic";

const ENTITY_TYPES = ["THEME", "SUBCATEGORY", "BELIEF", "TRUNK", "BRANCH", "CONNECTOR", "SAFETY_TEXT", "CONSENT_TEXT", "EMAIL_TEMPLATE"] as const;
const STATUSES = ["NOT_TRANSLATED", "AUTO_TRANSLATED", "NEEDS_REVIEW", "APPROVED", "PUBLISHED"] as const;

export default async function IdentityTranslationsPage() {
  const { table, locales } = await getTranslationsOverview();
  const beliefs = await prisma.identityBelief.findMany({
    orderBy: { stableKey: "asc" },
    select: { id: true, stableKey: true },
  });

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Tulkojumi"
        description="Seguma matrica pa entītiju tipiem un valodām. Rediģēšana notiek attiecīgajās entītiju lapās." />
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="type-caption px-3 py-2 text-ink-subtle">Entītija</th>
              {locales.map((l) => (
                <th key={l} className="type-caption px-3 py-2 text-ink-subtle">{l.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENTITY_TYPES.map((etype) => (
              <tr key={etype} className="border-t border-border-subtle align-top">
                <td className="px-3 py-2 font-medium">{etype}</td>
                {locales.map((locale) => {
                  const cell = table[etype]?.[locale] ?? {};
                  const total = STATUSES.reduce((n, s) => n + (cell[s] ?? 0), 0);
                  const published = cell.PUBLISHED ?? 0;
                  const pending = total - published;
                  return (
                    <td key={locale} className="px-3 py-2 text-xs">
                      {total === 0 ? "-" : (
                        <span title={STATUSES.map((s) => `${s}: ${cell[s] ?? 0}`).join("\n")}>
                          {published}/{total} pub.{pending ? ` (+${pending} gaida)` : ""}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="type-caption text-ink-subtle">
        Uzskatu tulkojumu rediģēšana: <Link href="/admin/identity-test/beliefs" className="text-accent">uzskatu saraksts</Link> ({beliefs.length} ieraksti).
      </p>
    </div>
  );
}
