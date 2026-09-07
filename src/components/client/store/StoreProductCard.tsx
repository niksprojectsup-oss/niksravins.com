"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { clientPortalContent } from "@/content/client-portal";
import { formatCurrency } from "@/lib/admin/format";
import type { StoreProductRecord } from "@/lib/store/types";

type StoreProductCardProps = {
  product: StoreProductRecord;
  owned: boolean;
};

export function StoreProductCard({ product, owned }: StoreProductCardProps) {
  const store = clientPortalContent.store;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/store-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? store.checkoutError);
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(store.checkoutError);
      setPending(false);
    }
  }

  return (
    <article className="observed-card flex h-full flex-col p-6 md:p-7">
      <div className="layout-stack-sm flex-1">
        <p className="type-label">{store.productTypes[product.productType]}</p>
        <h2 className="type-heading-sm">{product.title}</h2>
        <p className="type-body text-ink-muted">{product.description}</p>
        <p className="type-caption pt-2 text-ink">
          {store.price}: {formatCurrency(product.priceCents, product.currency)}
        </p>
      </div>

      <div className="pt-6">
        {owned ? (
          <p className="type-caption font-medium text-accent">{store.purchased}</p>
        ) : (
          <>
            {error ? (
              <p className="type-caption mb-3 text-warm" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={handleBuy}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? store.processing : store.buy}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
