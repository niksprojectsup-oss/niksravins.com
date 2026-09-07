import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreProductForm } from "@/components/admin/StoreProductForm";
import { adminPages } from "@/content/admin";

export default function AdminNewStoreProductPage() {
  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title="Add product"
        description={adminPages.store.description}
      />
      <StoreProductForm />
    </div>
  );
}
