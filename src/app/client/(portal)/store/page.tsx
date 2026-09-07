import { StoreProductCard } from "@/components/client/store/StoreProductCard";
import { clientPortalContent } from "@/content/client-portal";
import { requireClient } from "@/lib/auth/client-guards";
import { listPublishedStoreProducts } from "@/lib/store/product-repository";
import { listClientPurchases } from "@/lib/store/purchase-repository";

export default async function ClientStorePage() {
  const session = await requireClient();
  const [products, purchases] = await Promise.all([
    listPublishedStoreProducts(),
    listClientPurchases(session.clientId!),
  ]);

  const ownedProductIds = new Set(purchases.map((purchase) => purchase.productId));
  const store = clientPortalContent.store;

  return (
    <div className="layout-stack-lg max-w-wide">
      <header className="layout-stack-sm border-b border-border-subtle pb-6">
        <h1 className="type-heading-sm">{store.title}</h1>
        <p className="type-body text-ink-muted">
          Digital content for your personal transformation journey.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="observed-card p-6 md:p-8">
          <p className="type-body">{store.emptyStore}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {products.map((product) => (
            <StoreProductCard
              key={product.id}
              product={product}
              owned={ownedProductIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
