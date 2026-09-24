import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolveCmsImageStorageProviderName } from "@/lib/cms/image-storage/provider-factory";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("cms image storage provider factory", () => {
  it("defaults to local provider in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.CMS_IMAGE_STORAGE_PROVIDER;
    delete process.env.BLOB_READ_WRITE_TOKEN;

    assert.equal(resolveCmsImageStorageProviderName(), "local");
  });

  it("uses explicit local provider when configured", () => {
    process.env.CMS_IMAGE_STORAGE_PROVIDER = "local";
    assert.equal(resolveCmsImageStorageProviderName(), "local");
  });

  it("uses vercel blob when explicitly configured", () => {
    process.env.CMS_IMAGE_STORAGE_PROVIDER = "vercel-blob";
    assert.equal(resolveCmsImageStorageProviderName(), "vercel-blob");
  });

  it("auto-selects vercel blob on Vercel production runtime", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL = "1";
    delete process.env.CMS_IMAGE_STORAGE_PROVIDER;

    assert.equal(resolveCmsImageStorageProviderName(), "vercel-blob");
  });

  it("stays local in production outside Vercel", () => {
    process.env.NODE_ENV = "production";
    delete process.env.VERCEL;
    delete process.env.CMS_IMAGE_STORAGE_PROVIDER;

    assert.equal(resolveCmsImageStorageProviderName(), "local");
  });
});
