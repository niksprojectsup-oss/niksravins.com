import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CMS_IMAGE_MAX_BYTES,
  validateCmsImageUpload,
} from "@/lib/cms/image-storage/validation";

describe("cms image upload validation", () => {
  it("accepts supported image types", () => {
    const result = validateCmsImageUpload({
      size: 1024,
      mimeType: "image/png",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.extension, "png");
    }
  });

  it("rejects empty files", () => {
    const result = validateCmsImageUpload({
      size: 0,
      mimeType: "image/png",
    });

    assert.equal(result.ok, false);
  });

  it("rejects oversized files", () => {
    const result = validateCmsImageUpload({
      size: CMS_IMAGE_MAX_BYTES + 1,
      mimeType: "image/jpeg",
    });

    assert.equal(result.ok, false);
  });

  it("rejects unsupported mime types", () => {
    const result = validateCmsImageUpload({
      size: 1024,
      mimeType: "application/pdf",
    });

    assert.equal(result.ok, false);
  });

  it("rejects svg uploads", () => {
    const result = validateCmsImageUpload({
      size: 1024,
      mimeType: "image/svg+xml",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /SVG/i);
    }
  });
});
