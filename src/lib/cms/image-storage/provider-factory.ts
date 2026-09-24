import { localCmsImageStorageProvider } from "./local-provider";
import type { CmsImageStorageProvider, CmsImageStorageProviderName } from "./types";
import { vercelBlobCmsImageStorageProvider } from "./vercel-blob-provider";

function isVercelProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" && process.env.VERCEL === "1";
}

export function resolveCmsImageStorageProviderName(): CmsImageStorageProviderName {
  const configured = process.env.CMS_IMAGE_STORAGE_PROVIDER?.trim().toLowerCase();

  if (configured === "vercel-blob" || configured === "blob") {
    return "vercel-blob";
  }

  if (configured === "local") {
    return "local";
  }

  // Vercel Blob store integration injects OIDC credentials at runtime on Vercel.
  if (isVercelProductionRuntime()) {
    return "vercel-blob";
  }

  return "local";
}

export function getCmsImageStorageProvider(): CmsImageStorageProvider {
  const providerName = resolveCmsImageStorageProviderName();

  switch (providerName) {
    case "local":
      return localCmsImageStorageProvider;
    case "vercel-blob":
      return vercelBlobCmsImageStorageProvider;
    default:
      return localCmsImageStorageProvider;
  }
}
