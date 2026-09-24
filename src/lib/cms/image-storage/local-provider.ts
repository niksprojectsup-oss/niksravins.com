import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CmsImageStorageProvider, CmsImageUploadInput, CmsImageUploadOutput } from "./types";

function getLocalUploadDir(): string {
  return path.join(process.cwd(), "public", "cms-uploads");
}

export const localCmsImageStorageProvider: CmsImageStorageProvider = {
  async uploadImage(input: CmsImageUploadInput): Promise<CmsImageUploadOutput> {
    const filename = `${randomUUID()}.${input.extension}`;
    const uploadDir = getLocalUploadDir();
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), input.buffer);

    return {
      url: `/cms-uploads/${filename}`,
      filename,
    };
  },
};
