import { clientPortalContent } from "@/content/client-portal";
import type { PurchaseRecord } from "@/lib/store/types";
import { Button } from "@/components/ui/Button";

type PurchaseCardProps = {
  purchase: PurchaseRecord;
};

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  const store = clientPortalContent.store;
  const { product } = purchase;
  const isPlayable =
    product.productType === "VIDEO" ||
    product.productType === "MEDITATION" ||
    product.productType === "COURSE";

  const actionLabel =
    product.productType === "MEDITATION" ? store.listenWatch : store.watch;

  return (
    <article className="observed-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-7">
      <div className="layout-stack-sm">
        <p className="type-label">{store.productTypes[product.productType]}</p>
        <h2 className="type-heading-sm">{product.title}</h2>
        <p className="type-caption text-accent">{store.purchased}</p>
      </div>

      {isPlayable && product.contentKey ? (
        <Button href={`/client/purchases/${product.id}/watch`}>{actionLabel}</Button>
      ) : (
        <p className="type-caption text-ink-subtle">{store.contentComingSoon}</p>
      )}
    </article>
  );
}

export function PurchasesSuccessNotice({ visible }: { visible: boolean }) {
  const store = clientPortalContent.store;
  if (!visible) return null;

  return (
    <div className="observed-card border-accent/30 bg-accent-soft/30 p-5">
      <p className="type-body text-ink">{store.paymentSuccessNotice}</p>
    </div>
  );
}
