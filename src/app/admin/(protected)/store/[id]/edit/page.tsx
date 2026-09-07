import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreProductForm } from "@/components/admin/StoreProductForm";
import { adminPages } from "@/content/admin";
import { getStoreProductRecordById } from "@/lib/store/product-repository";

type EditStoreProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditStoreProductPage({
  params,
}: EditStoreProductPageProps) {
  const { id } = await params;
  const product = await getStoreProductRecordById(id);
  if (!product) notFound();

  return (
    <div className="layout-stack-lg max-w-wide">
      <AdminPageHeader
        title={`Edit ${product.title}`}
        description={adminPages.store.description}
      />
      <StoreProductForm product={product} />
    </div>
  );
}
