import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OfferForm } from "@/components/admin/OfferForm";
import { adminPages } from "@/content/admin";

export default function AdminNewOfferPage() {
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Add offer"
        description={adminPages.packages.description}
      />
      <OfferForm />
    </div>
  );
}
