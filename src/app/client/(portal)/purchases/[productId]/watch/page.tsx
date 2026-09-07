import Link from "next/link";
import { notFound } from "next/navigation";
import { SecureVideoPlayer } from "@/components/client/store/SecureVideoPlayer";
import { clientPortalContent } from "@/content/client-portal";
import { requireClient } from "@/lib/auth/client-guards";
import { canAccessStoreContent } from "@/lib/store/access";
import { DEFAULT_LICENSE_NOTICE } from "@/lib/store/types";
import { getStoreProductById } from "@/lib/store/product-repository";
import { getClientPurchaseForProduct } from "@/lib/store/purchase-repository";

type WatchPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ClientPurchaseWatchPage({ params }: WatchPageProps) {
  const session = await requireClient();
  const { productId } = await params;
  const store = clientPortalContent.store;

  const [product, purchase] = await Promise.all([
    getStoreProductById(productId),
    getClientPurchaseForProduct(session.clientId!, productId),
  ]);

  const access = canAccessStoreContent({
    authenticatedClientId: session.clientId!,
    productId,
    product,
    purchase,
  });

  if (!access.allowed) {
    return (
      <div className="layout-stack-lg max-w-wide">
        <div className="observed-card p-6 md:p-8">
          <h1 className="type-heading-sm">{store.accessDenied}</h1>
          <p className="type-body mt-3 text-ink-muted">{access.reason}</p>
          <Link href="/client/purchases" className="type-accent-link mt-6 inline-block">
            {store.backToPurchases}
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="layout-stack-lg max-w-wide">
      <header className="layout-stack-sm border-b border-border-subtle pb-6">
        <h1 className="type-heading-sm">{product.title}</h1>
        <Link href="/client/purchases" className="type-accent-link type-caption">
          {store.backToPurchases}
        </Link>
      </header>

      <SecureVideoPlayer
        src={`/api/client/store/content/${product.id}`}
        watermark={session.email}
        licenseNotice={product.licenseNotice ?? DEFAULT_LICENSE_NOTICE}
        title={product.title}
        watchLabel={store.watch}
      />
    </div>
  );
}
