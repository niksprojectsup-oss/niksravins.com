import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { localStoreContentProvider, resolveStoreContentPath } from "@/lib/store/content/local-provider";
import { getStoreContentProvider } from "@/lib/store/content/provider-factory";
import { openStoreContent } from "@/lib/store/content/open-content";

const originalContentRoot = process.env.STORE_CONTENT_ROOT;
const originalContentProvider = process.env.STORE_CONTENT_PROVIDER;

describe("local store content provider", () => {
  let tempRoot = "";

  beforeEach(() => {
    tempRoot = mkdtempSync(path.join(tmpdir(), "store-content-test-"));
    process.env.STORE_CONTENT_ROOT = tempRoot;
    delete process.env.STORE_CONTENT_PROVIDER;
    writeFileSync(path.join(tempRoot, "sample.mp4"), "0123456789abcdef");
  });

  afterEach(() => {
    if (originalContentRoot === undefined) {
      delete process.env.STORE_CONTENT_ROOT;
    } else {
      process.env.STORE_CONTENT_ROOT = originalContentRoot;
    }

    if (originalContentProvider === undefined) {
      delete process.env.STORE_CONTENT_PROVIDER;
    } else {
      process.env.STORE_CONTENT_PROVIDER = originalContentProvider;
    }
  });

  it("opens a full file", async () => {
    const result = await localStoreContentProvider.open({
      objectKey: "sample.mp4",
      mimeType: "video/mp4",
    });

    assert.equal(result.ranged, false);
    assert.equal(result.totalSize, 16);

    const text = await new Response(result.body).text();
    assert.equal(text, "0123456789abcdef");
  });

  it("opens a byte range", async () => {
    const result = await localStoreContentProvider.open(
      { objectKey: "sample.mp4", mimeType: "video/mp4" },
      { start: 4, end: 7 },
    );

    assert.equal(result.ranged, true);
    assert.equal(result.rangeStart, 4);
    assert.equal(result.rangeEnd, 7);
    assert.equal(result.totalSize, 16);

    const text = await new Response(result.body).text();
    assert.equal(text, "4567");
  });

  it("rejects traversal attempts", () => {
    assert.throws(
      () => resolveStoreContentPath("../../etc/passwd"),
      /Invalid content key/,
    );
    assert.throws(
      () => resolveStoreContentPath("../outside.txt"),
      /Invalid content key/,
    );
  });

  it("selects local provider by default", () => {
    delete process.env.STORE_CONTENT_PROVIDER;
    assert.equal(getStoreContentProvider(), localStoreContentProvider);
  });

  it("throws for unimplemented providers", () => {
    process.env.STORE_CONTENT_PROVIDER = "s3";
    assert.throws(
      () => getStoreContentProvider(),
      /not implemented yet/,
    );
  });

  it("delegates openStoreContent to the local provider", async () => {
    const result = await openStoreContent({
      objectKey: "sample.mp4",
      mimeType: "video/mp4",
    });

    assert.equal(result.totalSize, 16);
    assert.equal(result.ranged, false);
  });
});
