import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BetaInviteManager } from "@/components/admin/identity-test/BetaInviteManager";

export const dynamic = "force-dynamic";

export default async function IdentityBetaPage() {
  const invites = await prisma.identityBetaInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Beta piekļuve"
        description="Uzaicinājuma saites slēgtai beta testēšanai. Katra saite der, kamēr nav izlietota, nav atsaukta vai nav beidzies derīgums."
      />
      <BetaInviteManager
        invites={invites.map((i) => ({
          id: i.id,
          label: i.label,
          uses: i.uses,
          maxUses: i.maxUses,
          expiresAt: i.expiresAt.toISOString(),
          revokedAt: i.revokedAt?.toISOString() ?? null,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
