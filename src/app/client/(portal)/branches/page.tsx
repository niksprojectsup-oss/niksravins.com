import { PortalIconBadge } from "@/components/client/portal/PortalIcon";
import { getPortalContent } from "@/content/i18n/portal";
import { requireClient } from "@/lib/auth/client-guards";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { getClientBranchesView } from "@/lib/development/repository";

export default async function ClientBranchesPage() {
  const session = await requireClient();
  const locale = await getPortalLocale();
  const content = getPortalContent(locale);
  const view = await getClientBranchesView(session.clientId!, locale);

  const lv = locale === "lv";
  const labels = {
    progress: lv ? "Mans progress" : "My progress",
    completed: lv ? "pabeigtas" : "completed",
    remaining: lv ? "atlikušas" : "remaining",
    units: lv ? "darba vienības" : "work units",
    structure: lv ? "Mani izaicinājumi no Identitātes testa" : "My patterns from the Identity Test",
    noPlan: lv
      ? "Speciālists vēl nav izveidojis tavu darba plānu - progress parādīsies, kad tas būs gatavs."
      : "Your practitioner has not created your work plan yet - progress will appear once it is ready.",
  };

  return (
    <section className="space-y-6">
      <div className="portal-card p-5 md:p-6">
        <div className="flex items-center gap-3">
          <PortalIconBadge name="tree" tone="sage" />
          <h1 className="portal-page-title text-[#2c2824]">{content.trunksPage.title}</h1>
        </div>

        {view.progress.totalTrunks > 0 ? (
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#6d675f]">{labels.progress}</span>
              <span className="text-2xl font-semibold text-[#2c2824]">
                {view.progress.percent}%
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#efe9e2]">
              <div
                className="h-full rounded-full bg-[#7a8b6f] transition-all"
                style={{ width: `${view.progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[#6d675f]">
              {view.progress.completedTrunks}/{view.progress.totalTrunks} {labels.units}{" "}
              {labels.completed} · {view.progress.remainingTrunks} {labels.remaining}
            </p>
          </div>
        ) : (
          <p className="mt-3 max-w-2xl text-[#6d675f]">
            {view.hasTest ? labels.noPlan : content.trunksPage.empty}
          </p>
        )}
      </div>

      {view.groups.length > 0 && (
        <div className="portal-card p-5 md:p-6">
          <h2 className="text-lg font-semibold text-[#2c2824]">{labels.structure}</h2>
          <div className="mt-4 space-y-5">
            {view.groups.map((g) => (
              <div key={g.themeName}>
                <h3 className="text-sm font-medium uppercase tracking-wide text-[#8a8378]">
                  {g.themeName}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {g.beliefs.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[#3d3831]">
                      <span className="text-[#8a8378]">·</span>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
