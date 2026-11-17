/**
 * Vienotais progresa aprēķins - izmanto GAN admin panelis, GAN klienta portāls.
 * Progress = pabeigto aktīvo stumbru skaits / kopējais aktīvo stumbru skaits.
 */
import { prisma } from "@/lib/db/prisma";

export type DevelopmentProgress = {
  totalTrunks: number;
  completedTrunks: number;
  inProgressTrunks: number;
  remainingTrunks: number;
  percent: number; // 0-100, null aizstāts ar 0 ja nav stumbru
};

export function computeDevelopmentProgress(input: {
  totalTrunks: number;
  completedTrunks: number;
  inProgressTrunks: number;
}): DevelopmentProgress {
  const { totalTrunks, completedTrunks, inProgressTrunks } = input;
  const remainingTrunks = Math.max(totalTrunks - completedTrunks, 0);
  const percent = totalTrunks === 0 ? 0 : Math.round((completedTrunks / totalTrunks) * 100);
  return { totalTrunks, completedTrunks, inProgressTrunks, remainingTrunks, percent };
}

export async function getClientDevelopmentProgress(
  clientId: string,
): Promise<DevelopmentProgress> {
  const grouped = await prisma.clientDevelopmentTrunk.groupBy({
    by: ["status"],
    where: { clientId },
    _count: { _all: true },
  });
  const count = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  return computeDevelopmentProgress({
    totalTrunks: grouped.reduce((n, g) => n + g._count._all, 0),
    completedTrunks: count("COMPLETED"),
    inProgressTrunks: count("IN_PROGRESS") + count("NEEDS_SUPPLEMENT"),
  });
}
