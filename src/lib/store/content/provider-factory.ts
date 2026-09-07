import { localStoreContentProvider } from "@/lib/store/content/local-provider";
import type { StoreContentProvider } from "@/lib/store/content/types";

export type StoreContentProviderName = "local";

function resolveProviderName(): StoreContentProviderName {
  const configured = process.env.STORE_CONTENT_PROVIDER?.trim().toLowerCase();

  if (!configured || configured === "local") {
    return "local";
  }

  throw new Error(
    `Store content provider "${configured}" is not implemented yet. Set STORE_CONTENT_PROVIDER=local.`,
  );
}

export function getStoreContentProvider(): StoreContentProvider {
  const providerName = resolveProviderName();

  switch (providerName) {
    case "local":
      return localStoreContentProvider;
    default:
      throw new Error(
        `Store content provider "${providerName}" is not implemented yet. Set STORE_CONTENT_PROVIDER=local.`,
      );
  }
}
