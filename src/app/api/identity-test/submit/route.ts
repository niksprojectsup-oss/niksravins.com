import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { processSubmission } from "@/lib/identity-test/submit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isBetaRequestAllowed } from "@/lib/identity-test/beta";
import type { SubmitPayload } from "@/lib/identity-test/types";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit("api.general", `identity-submit:${clientIp(request)}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  if (!(await isBetaRequestAllowed())) {
    return NextResponse.json({ ok: false, reason: "beta_closed" }, { status: 403 });
  }

  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  try {
    const result = await processSubmission(body);
    if (result.ok) {
      return NextResponse.json({ ok: true });
    }
    const status = result.reason === "email_failed" ? 502 : 422;
    return NextResponse.json(
      { ok: false, reason: result.reason, message: result.message },
      { status },
    );
  } catch (error) {
    console.error("[identity-test] submit failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 500 });
  }
}
