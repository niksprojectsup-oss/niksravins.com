import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OfferForm } from "@/components/admin/OfferForm";
import { getOfferRecordById } from "@/lib/booking/offer-repository";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditOfferPage({ params }: PageProps) {
  const { id } = await params;
  const offer = await getOfferRecordById(id);

  if (!offer) {
    notFound();
  }

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Edit offer"
        description={offer.title}
      />
      <OfferForm offer={offer} />
    </div>
  );
}
