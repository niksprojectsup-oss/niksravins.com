import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAccessStoreContent, isProductVisibleInStore, shouldCreatePurchaseFromWebhook } from "@/lib/store/access";
import {
  clientOwnsProduct,
  isPublishedProduct,
  resolveCheckoutType,
} from "@/lib/store/types";

const clientA = "client-a";
const clientB = "client-b";
const productId = "product-1";

const publishedProduct = {
  id: productId,
  status: "PUBLISHED" as const,
  contentKey: "yoga.mp4",
  contentMimeType: "video/mp4",
};

const draftProduct = {
  id: productId,
  status: "DRAFT" as const,
  contentKey: "yoga.mp4",
  contentMimeType: "video/mp4",
};

const paidPurchase = {
  clientId: clientA,
  productId,
  status: "PAID" as const,
};

describe("store content access", () => {
  it("allows authenticated client with purchase", () => {
    const decision = canAccessStoreContent({
      authenticatedClientId: clientA,
      productId,
      product: publishedProduct,
      purchase: paidPurchase,
    });

    assert.equal(decision.allowed, true);
    if (decision.allowed) {
      assert.equal(decision.ref.objectKey, "yoga.mp4");
      assert.equal(decision.ref.mimeType, "video/mp4");
    }
  });

  it("denies authenticated client without purchase", () => {
    const decision = canAccessStoreContent({
      authenticatedClientId: clientA,
      productId,
      product: publishedProduct,
      purchase: null,
    });

    assert.equal(decision.allowed, false);
    if (!decision.allowed) {
      assert.match(decision.reason, /Purchase not found/);
    }
  });

  it("denies client A access to client B purchase", () => {
    const decision = canAccessStoreContent({
      authenticatedClientId: clientA,
      productId,
      product: publishedProduct,
      purchase: { ...paidPurchase, clientId: clientB },
    });

    assert.equal(decision.allowed, false);
    if (!decision.allowed) {
      assert.equal(decision.reason, "Access denied.");
    }
  });

  it("denies access when product has no content key", () => {
    const decision = canAccessStoreContent({
      authenticatedClientId: clientA,
      productId,
      product: { ...publishedProduct, contentKey: null },
      purchase: paidPurchase,
    });

    assert.equal(decision.allowed, false);
  });
});

describe("store visibility", () => {
  it("shows only published products in store", () => {
    assert.equal(isProductVisibleInStore(publishedProduct), true);
    assert.equal(isProductVisibleInStore(draftProduct), false);
    assert.equal(isPublishedProduct(publishedProduct), true);
    assert.equal(isPublishedProduct(draftProduct), false);
  });
});

describe("checkout routing", () => {
  it("routes store checkout by explicit metadata", () => {
    assert.equal(
      resolveCheckoutType({ checkoutType: "store", productId: "p1", clientId: "c1" }),
      "store",
    );
  });

  it("routes booking checkout by explicit metadata", () => {
    assert.equal(
      resolveCheckoutType({
        checkoutType: "booking",
        serviceId: "offer-1",
        email: "client@example.com",
      }),
      "booking",
    );
  });

  it("falls back to store when productId is present", () => {
    assert.equal(resolveCheckoutType({ productId: "p1", clientId: "c1" }), "store");
  });

  it("defaults to booking when no store markers exist", () => {
    assert.equal(
      resolveCheckoutType({ serviceId: "offer-1", email: "client@example.com" }),
      "booking",
    );
  });
});

describe("purchase ownership", () => {
  it("recognizes paid ownership for the same client", () => {
    assert.equal(clientOwnsProduct(clientA, paidPurchase), true);
  });

  it("rejects unpaid or foreign purchases", () => {
    assert.equal(clientOwnsProduct(clientA, null), false);
    assert.equal(
      clientOwnsProduct(clientA, { ...paidPurchase, status: "PENDING" }),
      false,
    );
    assert.equal(
      clientOwnsProduct(clientA, { ...paidPurchase, clientId: clientB }),
      false,
    );
  });
});

describe("webhook idempotency guard", () => {
  it("skips duplicate purchase creation when payment already has purchase", () => {
    assert.equal(
      shouldCreatePurchaseFromWebhook({ existingPaymentHasPurchase: true }),
      false,
    );
  });

  it("allows purchase creation when payment has no purchase yet", () => {
    assert.equal(
      shouldCreatePurchaseFromWebhook({ existingPaymentHasPurchase: false }),
      true,
    );
  });
});
