import {
  PurchaseCard,
  PurchasesSuccessNotice,
} from "@/components/client/store/PurchaseCard";
import { clientPortalContent } from "@/content/client-portal";
import { requireClient } from "@/lib/auth/client-guards";
import { listClientPurchases } from "@/lib/store/purchase-repository";

type ClientPurchasesPageProps = {
  searchParams: Promise<{ payment?: string }>;
};

export default async function ClientPurchasesPage({
  searchParams,
}: ClientPurchasesPageProps) {
  const session = await requireClient();
  const params = await searchParams;
  const purchases = await listClientPurchases(session.clientId!);
  const store = clientPortalContent.store;

  return (
    <div className="layout-stack-lg max-w-wide">
      <header className="layout-stack-sm border-b border-border-subtle pb-6">
        <h1 className="type-heading-sm">{store.myPurchases}</h1>
        <p className="type-body text-ink-muted">
          Content you have purchased appears here.
        </p>
      </header>

      <PurchasesSuccessNotice visible={params.payment === "success"} />

      {purchases.length === 0 ? (
        <div className="observed-card p-6 md:p-8">
          <p className="type-body">{store.emptyPurchases}</p>
        </div>
      ) : (
        <div className="layout-stack-md">
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
