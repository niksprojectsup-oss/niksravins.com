import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminSessionIsActive,
  isTransientDatabaseError,
  lookupAdminSessionActive,
} from "@/lib/auth/admin-session-status";

const now = Date.parse("2026-10-16T00:00:00.000Z");

describe("admin session activity", () => {
  it("treats a missing or expired session as inactive", () => {
    assert.equal(adminSessionIsActive(null, now), false);
    assert.equal(
      adminSessionIsActive({ expiresAt: new Date(now - 1_000) }, now),
      false,
    );
  });

  it("treats a future session as active", () => {
    assert.equal(
      adminSessionIsActive({ expiresAt: new Date(now + 60_000) }, now),
      true,
    );
  });

  it("retries a closed database connection and still recognizes an active session", async () => {
    let attempts = 0;
    const active = await lookupAdminSessionActive(
      "session-1",
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw Object.assign(new Error("Can't reach database server"), { code: "P1001" });
        }
        return { expiresAt: new Date(now + 60_000) };
      },
      now,
    );

    assert.equal(attempts, 2);
    assert.equal(active, true);
  });

  it("does not report a database failure as an inactive session", async () => {
    await assert.rejects(
      lookupAdminSessionActive("session-1", async () => {
        throw Object.assign(new Error("Server has closed the connection"), { code: "P1017" });
      }),
      /closed the connection/i,
    );

    await assert.rejects(
      lookupAdminSessionActive("session-1", async () => {
        throw new Error("Invalid prisma invocation");
      }),
      /Invalid prisma invocation/,
    );
  });

  it("recognizes transient database errors", () => {
    assert.equal(isTransientDatabaseError(Object.assign(new Error("x"), { code: "P1001" })), true);
    assert.equal(isTransientDatabaseError(new Error("Invalid prisma invocation")), false);
  });
});
