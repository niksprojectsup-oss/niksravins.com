import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { processDueSequences } from "@/lib/identity-test/sequence";
import { pruneRateLimitBuckets } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Vercel Cron: GET /api/cron/identity-email-sequence (vercel.json, 1×/dienā). */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const summary = await processDueSequences();
    const prunedRateLimits = await pruneRateLimitBuckets().catch(() => 0);
    return NextResponse.json({ ok: true, ...summary, prunedRateLimits });
  } catch (error) {
    console.error("[identity-test] cron failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
