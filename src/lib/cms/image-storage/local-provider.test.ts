import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { localCmsImageStorageProvider } from "@/lib/cms/image-storage/local-provider";

const originalCwd = process.cwd();
let tempDir = "";

afterEach(async () => {
  process.chdir(originalCwd);
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = "";
  }
});

describe("local cms image storage provider", () => {
  it("writes uploaded images under public/cms-uploads and returns a public url", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "cms-image-upload-"));
    process.chdir(tempDir);
    await mkdir(path.join(tempDir, "public", "cms-uploads"), { recursive: true });

    const buffer = Buffer.from("fake-image-bytes");
    const result = await localCmsImageStorageProvider.uploadImage({
      buffer,
      mimeType: "image/png",
      size: buffer.length,
      extension: "png",
    });

    assert.match(result.url, /^\/cms-uploads\/[0-9a-f-]+\.png$/);
    const saved = await readFile(path.join(tempDir, "public", result.url));
    assert.equal(saved.toString(), "fake-image-bytes");
  });
});
