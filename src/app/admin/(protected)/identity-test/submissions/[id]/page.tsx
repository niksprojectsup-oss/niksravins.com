import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSubmissionResultForAdmin } from "@/lib/development/repository";
import { resolveTranslation } from "@/lib/identity-test/content";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [submission, result] = await Promise.all([
    prisma.identityTestSubmission.findUnique({
      where: { id },
      include: {
        deliveries: { orderBy: { createdAt: "desc" } },
        consents: { orderBy: { createdAt: "desc" } },
      },
    }),
    getSubmissionResultForAdmin(id),
  ]);
  if (!submission) notFound();

  const beliefs = await prisma.identityBelief.findMany({
    where: { id: { in: submission.selectedBeliefIds } },
    include: { subcategory: { include: { theme: true } } },
  });
  const translations = beliefs.length
    ? await prisma.identityContentTranslation.findMany({
        where: {
          OR: [
            { entityType: "BELIEF", entityId: { in: beliefs.map((b) => b.id) }, field: "text" },
            { entityType: "THEME", entityId: { in: beliefs.map((b) => b.subcategory.themeId) }, field: "name" },
            { entityType: "SUBCATEGORY", entityId: { in: beliefs.map((b) => b.subcategoryId) }, field: "name" },
          ],
          publishedValue: { not: null },
        },
      })
    : [];
  const tx = (entityId: string, field: string) =>
    resolveTranslation(translations, { entityId, field, locale: submission.locale })?.value ?? "";

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Testa iesniegums"
        description={`${submission.createdAt.toISOString().replace("T", " ").slice(0, 16)} · locale ${submission.locale} · statuss ${submission.status}`}
      />

      <section className="observed-card p-6">
        <h2 className="type-heading-sm">Sasaiste</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <dt className="type-caption text-ink-subtle">Statuss</dt>
            <dd>{submission.linkStatus}</dd>
          </div>
          <div>
            <dt className="type-caption text-ink-subtle">Klients</dt>
            <dd>
              {submission.clientId ? (
                <Link href={`/admin/clients/${submission.clientId}`} className="text-accent underline">
                  atvērt profilu →
                </Link>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="type-caption text-ink-subtle">Metode</dt>
            <dd>{submission.linkMethod ?? "-"}</dd>
          </div>
          <div>
            <dt className="type-caption text-ink-subtle">Drošības karogs</dt>
            <dd>{submission.safetyTriggered ? "jā" : "nē"}</dd>
          </div>
        </dl>
        {result && (
          <p className="mt-3 text-sm text-ink-subtle">
            {result.name ? `Vārds: ${result.name} · ` : ""}E-pasts: {result.email}
          </p>
        )}
      </section>

      <section className="observed-card p-6">
        <h2 className="type-heading-sm">Izvēlētie uzskati ({beliefs.length})</h2>
        <ul className="mt-3 space-y-2">
          {beliefs.map((b) => (
            <li key={b.id} className="text-sm">
              <span className="text-ink-subtle">
                {tx(b.subcategory.themeId, "name") || b.subcategory.theme.slug} /{" "}
                {tx(b.subcategoryId, "name")}:
              </span>{" "}
              {tx(b.id, "text")}
              {b.subcategory.theme.isSensitive && (
                <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">sensitīva</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {result && result.emailThemes.length > 0 ? (
        <section className="observed-card p-6">
          <h2 className="type-heading-sm">Portreti</h2>
          <p className="mt-1 text-sm text-ink-subtle">Kā nosūtīts klientam e-pastā, grupēts pa tēmām.</p>
          <div className="mt-4 space-y-5">
            {result.emailThemes.map((t) => (
              <div key={t.name} className="rounded-md border border-border-subtle p-4">
                <h3 className="type-caption font-semibold">{t.name}</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="type-caption text-ink-subtle">Pašreizējais portrets</h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{t.now}</p>
                  </div>
                  <div>
                    <h4 className="type-caption text-ink-subtle">Nākotnes portrets</h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{t.future}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : result ? (
        <section className="observed-card p-6">
          <h2 className="type-heading-sm">Portreti</h2>
          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="type-caption text-ink-subtle">Pašreizējais portrets</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm">{result.portraitNow}</p>
            </div>
            <div>
              <h3 className="type-caption text-ink-subtle">Nākotnes portrets</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm">{result.portraitFuture}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="observed-card p-6">
        <h2 className="type-heading-sm">Piegādes</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {submission.deliveries.map((d) => (
            <li key={d.id}>
              {d.createdAt.toISOString().replace("T", " ").slice(0, 16)} - {d.emailKind}: {d.status}
            </li>
          ))}
          {submission.deliveries.length === 0 && <li className="text-ink-subtle">Nav piegāžu.</li>}
        </ul>
      </section>
    </div>
  );
}
