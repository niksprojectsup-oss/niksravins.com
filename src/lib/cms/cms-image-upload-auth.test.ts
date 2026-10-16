import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorizeCmsImageUpload } from "@/lib/cms/cms-image-upload-auth";

const admin = { role: "ADMIN", mfaVerified: true };

describe("cms image upload authorization", () => {
  it("rejects missing, non-admin, pending, and inactive sessions with 401", () => {
    for (const input of [
      { session: null, sessionActive: false },
      { session: { role: "CLIENT", mfaVerified: true }, sessionActive: true },
      { session: { role: "ADMIN", mfaVerified: false }, sessionActive: true },
      { session: admin, sessionActive: false },
    ] as const) {
      const result = authorizeCmsImageUpload(input);
      assert.deepEqual(result, { ok: false, status: 401, error: "Unauthorized" });
    }
  });

  it("does not turn an unavailable session store into Unauthorized", () => {
    const result = authorizeCmsImageUpload({
      session: admin,
      sessionActive: "unavailable",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 503);
      assert.notEqual(result.error, "Unauthorized");
    }
  });

  it("allows an active verified admin session", () => {
    assert.deepEqual(
      authorizeCmsImageUpload({ session: admin, sessionActive: true }),
      { ok: true },
    );
  });
});
