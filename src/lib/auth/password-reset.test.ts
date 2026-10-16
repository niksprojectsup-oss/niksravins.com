import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { buildResetPasswordEmail, buildResetPasswordUrl } from "@/lib/email/templates/reset-password";
import { checkRateLimit, getDefaultRateLimit } from "@/lib/security/rate-limit";
import { getAppBaseUrl } from "@/lib/url";
import {
  PASSWORD_RESET_TTL_MS,
  acknowledgePasswordReset,
  hashPasswordToken,
  isEligiblePasswordResetAccount,
  passwordTokenRejectionReason,
} from "./password-reset";

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe("password reset tokens", () => {
  const now = Date.parse("2026-10-16T12:00:00.000Z");

  it("rejects a missing token", () => {
    assert.equal(passwordTokenRejectionReason(null, now), "missing");
  });

  it("rejects a reused token", () => {
    assert.equal(
      passwordTokenRejectionReason(
        {
          usedAt: new Date(now - 1000),
          expiresAt: new Date(now + 60_000),
          role: "CLIENT",
        },
        now,
      ),
      "used",
    );
  });

  it("rejects an expired token", () => {
    assert.equal(
      passwordTokenRejectionReason(
        {
          usedAt: null,
          expiresAt: new Date(now),
          role: "CLIENT",
        },
        now,
      ),
      "expired",
    );
    assert.equal(
      passwordTokenRejectionReason(
        {
          usedAt: null,
          expiresAt: new Date(now - 1),
          role: "CLIENT",
        },
        now,
      ),
      "expired",
    );
  });

  it("rejects a token that does not belong to a client", () => {
    assert.equal(
      passwordTokenRejectionReason(
        {
          usedAt: null,
          expiresAt: new Date(now + 60_000),
          role: "ADMIN",
        },
        now,
      ),
      "not_client",
    );
  });

  it("accepts one unused client token before expiry", () => {
    assert.equal(
      passwordTokenRejectionReason(
        {
          usedAt: null,
          expiresAt: new Date(now + PASSWORD_RESET_TTL_MS),
          role: "CLIENT",
        },
        now,
      ),
      null,
    );
  });

  it("stores only a hash of the raw token and expires in one hour", () => {
    const raw = "reset-token";
    const stored = hashPasswordToken(raw);
    assert.notEqual(stored, raw);
    assert.equal(stored, createHash("sha256").update(raw).digest("hex"));
    assert.equal(stored.length, 64);
    assert.equal(PASSWORD_RESET_TTL_MS, 60 * 60 * 1000);
  });

  it("issues a reset only for an existing client account", () => {
    assert.equal(isEligiblePasswordResetAccount(null), false);
    assert.equal(isEligiblePasswordResetAccount(undefined), false);
    assert.equal(isEligiblePasswordResetAccount({ role: "ADMIN" }), false);
    assert.equal(isEligiblePasswordResetAccount({ role: "CLIENT" }), true);
  });

  it("returns the same acknowledgement whether or not an account exists", () => {
    const message = "If an account exists for that email, we sent a password reset link.";
    assert.deepEqual(acknowledgePasswordReset(message), { message });
    assert.deepEqual(acknowledgePasswordReset(message), acknowledgePasswordReset(message));
  });
});

describe("password reset email url", () => {
  it("uses the configured production domain", () => {
    withEnv(
      {
        NEXT_PUBLIC_APP_URL: "https://niksravins.com/",
        VERCEL_URL: "preview.example.vercel.app",
      },
      () => {
        const url = buildResetPasswordUrl("token with spaces");
        assert.equal(
          url,
          "https://niksravins.com/client/set-password?token=token%20with%20spaces",
        );
        assert.equal(getAppBaseUrl(), "https://niksravins.com");
      },
    );
  });

  it("falls back to the production domain when no host is configured", () => {
    withEnv(
      {
        NEXT_PUBLIC_APP_URL: undefined,
        VERCEL_URL: undefined,
        NODE_ENV: "production",
      },
      () => {
        assert.equal(
          buildResetPasswordUrl("abc"),
          "https://niksravins.com/client/set-password?token=abc",
        );
      },
    );
  });

  it("puts the production link in the message", () => {
    const message = buildResetPasswordEmail({
      firstName: "Ava <script>",
      resetUrl: "https://niksravins.com/client/set-password?token=abc",
    });
    assert.match(message.text, /https:\/\/niksravins\.com\/client\/set-password\?token=abc/);
    assert.match(message.text, /expires in 1 hour/);
    assert.match(message.html, /Ava &lt;script&gt;/);
    assert.doesNotMatch(message.html, /<script>/);
  });
});

describe("password reset limits and boundaries", () => {
  it("rate limits reset requests", () => {
    const identifier = `reset-test-${Date.now()}`;
    assert.equal(getDefaultRateLimit("auth.password_reset").limit, 5);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      assert.equal(checkRateLimit("auth.password_reset", identifier).allowed, true);
    }
    assert.equal(checkRateLimit("auth.password_reset", identifier).allowed, false);
  });

  it("keeps the request path public and away from account creation", () => {
    const proxy = readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8");
    assert.match(proxy, /\/client\/forgot-password/);

    const repository = readFileSync(new URL("./client-repository.ts", import.meta.url), "utf8");
    const resetStart = repository.indexOf("export async function requestClientPasswordReset");
    const resetEnd = repository.indexOf("export async function sendPortalSetupEmailForClient");
    const reset = repository.slice(resetStart, resetEnd);
    assert.doesNotMatch(reset, /ensureClientPortalAccount/);
    assert.doesNotMatch(reset, /prisma\.client\.(create|update|delete)/);
    assert.doesNotMatch(reset, /booking|payment|journal|session/i);
    assert.match(reset, /hashToken\(resetToken\)/);
    assert.match(reset, /usedAt: null/);

    const actions = readFileSync(new URL("./client-actions.ts", import.meta.url), "utf8");
    const actionStart = actions.indexOf("export async function clientForgotPasswordAction");
    const actionEnd = actions.indexOf("export async function clientLogoutAction");
    const action = actions.slice(actionStart, actionEnd);
    assert.match(action, /return acknowledgePasswordReset\(copy\.success\)/);
    assert.doesNotMatch(action, /ensureClientPortalAccount|createClientAuthSession/);

    const login = readFileSync(
      new URL("../../components/client/ClientLoginForm.tsx", import.meta.url),
      "utf8",
    );
    assert.match(login, /href="\/client\/forgot-password"/);
  });
});
