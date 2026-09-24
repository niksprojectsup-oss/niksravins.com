import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import type { CmsImageStorageProvider, CmsImageUploadInput, CmsImageUploadOutput } from "./types";

export const vercelBlobCmsImageStorageProvider: CmsImageStorageProvider = {
  async uploadImage(input: CmsImageUploadInput): Promise<CmsImageUploadOutput> {
    const filename = `${randomUUID()}.${input.extension}`;
    const pathname = `cms-uploads/${filename}`;

    // Auth resolves automatically: VERCEL_OIDC_TOKEN on Vercel, or BLOB_READ_WRITE_TOKEN fallback.
    const blob = await put(pathname, input.buffer, {
      access: "public",
      contentType: input.mimeType,
    });

    return {
      url: blob.url,
      filename,
    };
  },
};
