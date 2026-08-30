import { notFound, redirect } from "next/navigation";
import { PackageSessionBookingFlow } from "@/components/client/PackageSessionBookingFlow";
import { requireClient } from "@/lib/auth/client-guards";
import { getClientPackageForBooking } from "@/lib/client/package-booking-repository";
import { getServiceById } from "@/lib/booking/services-catalog";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ packageId: string }>;
};

export default async function ClientPackageBookPage({ params }: PageProps) {
  const { packageId } = await params;
  const session = await requireClient();
  const pkg = await getClientPackageForBooking(session.clientId!, packageId);

  if (!pkg) {
    redirect("/client/dashboard");
  }

  const service = await getServiceById(pkg.serviceId);

  if (!service) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: session.clientId! },
    select: { timezone: true },
  });

  return (
    <PackageSessionBookingFlow
      packageId={pkg.id}
      packageTitle={service.title}
      timezone={client?.timezone ?? "Europe/Riga"}
    />
  );
}
