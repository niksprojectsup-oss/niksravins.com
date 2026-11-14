import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resendResultEmail } from "@/lib/identity-test/submit";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** POST {requestId} - lietotāja atkārtots mēģinājums pēc neveiksmīgas piegādes. */
export async function POST(request: NextRequest) {
  const limit = await checkRateLimit("api.general", `identity-retry:${clientIp(request)}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { requestId?: string };
  try {
    body = (await request.json()) as { requestId?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const submission = await prisma.identityTestSubmission.findUnique({
    where: { requestId: body.requestId ?? "" },
    include: { result: true },
  });
  if (!submission?.result) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  const outcome = await resendResultEmail(submission.result.id);
  return NextResponse.json(
    outcome.ok ? { ok: true } : { ok: false, reason: outcome.reason },
    { status: outcome.ok ? 200 : 502 },
  );
}
