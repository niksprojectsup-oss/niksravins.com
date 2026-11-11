import Link from "next/link";
import { AdminPageHeader, AdminPanel, AdminStatCard } from "@/components/admin/AdminPageHeader";
import { getIdentityDashboard } from "@/lib/identity-test/admin-repository";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/admin/identity-test/themes", label: "Tēmas un apakštēmas" },
  { href: "/admin/identity-test/beliefs", label: "Uzskati (200)" },
  { href: "/admin/identity-test/mechanisms", label: "Mehānismu tagi un savienotājfrāzes" },
  { href: "/admin/identity-test/preview", label: "Rezultātu priekšskatījums" },
  { href: "/admin/identity-test/translations", label: "Tulkojumi" },
  { href: "/admin/identity-test/emails", label: "E-pasti un secības" },
  { href: "/admin/identity-test/submissions", label: "Iesniegumi un piegādes" },
  { href: "/admin/identity-test/versions", label: "Versiju vēsture" },
];

export default async function IdentityTestAdminPage() {
  const d = await getIdentityDashboard();
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader title="Identitātes Tests" description="Testa satura, rezultātu un e-pastu pārvaldība." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminStatCard label="Tēmas" value={String(d.themes)} />
        <AdminStatCard label="Apakštēmas" value={String(d.subcategories)} />
        <AdminStatCard label="Uzskati" value={String(d.beliefs)} />
        <AdminStatCard label="Iesniegumi" value={String(d.submissions)} />
        <AdminStatCard label="Publicēti uzskati" value={String(d.beliefByStatus.PUBLISHED ?? 0)} />
        <AdminStatCard label="Melnraksti" value={String(d.beliefByStatus.DRAFT ?? 0)} />
        <AdminStatCard label="Stumbri / zari" value={`${d.trunks} / ${d.branches}`} />
        <AdminStatCard label="Mārketinga piekrišanas" value={String(d.activeMarketingConsents)} />
        <AdminStatCard label="Nosūtīti e-pasti" value={String(d.deliveries.SENT ?? 0)} />
        <AdminStatCard label="Kļūdas piegādē" value={String(d.deliveries.FAILED ?? 0)} />
        <AdminStatCard label="Aktīvas secības" value={String(d.sequences.ACTIVE ?? 0)} />
        <AdminStatCard label="Atceltas secības" value={String(d.sequences.CANCELLED ?? 0)} />
      </div>

      {d.incompletePublished.length > 0 ? (
        <AdminPanel title="Brīdinājumi">
          <p className="type-caption text-ink-subtle">
            Publicēti uzskati bez pilniem portretu fragmentiem ({d.incompletePublished.length}):
          </p>
          <p className="type-caption mt-2 font-mono text-ink-muted">{d.incompletePublished.slice(0, 40).join(", ")}</p>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Sadaļas">
        <ul className="grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="type-body text-accent hover:text-accent-strong">
                {s.label} →
              </Link>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
